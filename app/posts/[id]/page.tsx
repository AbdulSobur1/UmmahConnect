import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { formatPostTime } from "@/lib/utils/time";
import { PostPublicClient } from "@/components/public/PostPublicClient";
import { postDto, publicProfileDto } from "@/lib/api/mappers";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: { id: string } };

type PostWithComments = ReturnType<typeof postDto> & {
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
    user: ReturnType<typeof publicProfileDto> | null;
  }>;
};

async function fetchPost(id: string): Promise<PostWithComments | null> {
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*, users:user_id(*)")
    .eq("id", id)
    .single();

  if (!post) return null;

  const { data: commentRows } = await supabase
    .from("comments")
    .select("*, users:user_id(*)")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  return {
    ...postDto({ ...post, users: post.users } as any),
    comments: (commentRows ?? []).map((row: any) => ({
      id: row.id,
      content: row.content,
      created_at: row.created_at ?? "",
      user: row.users ? publicProfileDto(row.users) : null,
    })),
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await fetchPost(params.id);
  if (!post) return { title: "Post not found" };
  const title =
    post.content.slice(0, 60) + (post.content.length > 60 ? "..." : "");
  const authorName = post.user?.full_name ?? "Ummah Connect member";
  return {
    title,
    description: post.content,
    openGraph: {
      title,
      description: post.content,
      type: "article",
      authors: [authorName],
    },
  };
}

export default async function PublicPostPage({ params }: PageProps) {
  const [post, user] = await Promise.all([
    fetchPost(params.id),
    getSessionUser(),
  ]);
  if (!post) notFound();

  return (
    <PublicLayout user={user}>
      <main className="page">
        <div className="container">
          <Link href="/" className="brand public-brand">
            Ummah <span>Connect</span>
          </Link>
          <article className="card public-card">
            <div className="row space-between">
              {post.user ? (
                <Link href={`/profiles/${post.user.id}`} className="public-link">
                  {post.user.full_name}
                </Link>
              ) : (
                <span>Member</span>
              )}
              <small className="muted">
                {formatPostTime(post.created_at)}
              </small>
            </div>
            <p className="public-text">{post.content}</p>
            <PostPublicClient
              postId={post.id}
              initialLikes={post.likes_count}
              user={user}
            />
            <section className="public-section">
              <h2 className="font-display public-subtitle">
                Comments ({post.comments.length})
              </h2>
              <div className="grid public-comments">
                {post.comments.map((comment) => (
                  <div className="card public-comment-card" key={comment.id}>
                    <div className="row space-between">
                      {comment.user ? (
                        <Link
                          href={`/profiles/${comment.user.id}`}
                          className="public-link"
                        >
                          {comment.user.full_name}
                        </Link>
                      ) : (
                        <span>Member</span>
                      )}
                      <small className="muted">
                        {formatPostTime(comment.created_at)}
                      </small>
                    </div>
                    <p className="public-copy">{comment.content}</p>
                  </div>
                ))}
                {post.comments.length === 0 ? (
                  <p className="muted">No comments yet.</p>
                ) : null}
              </div>
            </section>
          </article>
        </div>
      </main>
    </PublicLayout>
  );
}
