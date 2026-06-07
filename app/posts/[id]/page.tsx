import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { PostPublicClient } from '@/components/public/PostPublicClient';
import { postDto, publicProfileDto } from '@/lib/api/mappers';
import { getSessionUser } from '@/lib/auth/session';
import { getDemoPost, isDemoMode } from '@/lib/demo/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { CommentRow, PostRow, UserRow } from '@/lib/supabase/types';

type PageProps = { params: { id: string } };
type JoinedPost = PostRow & { users?: UserRow | null };
type JoinedComment = CommentRow & { users?: UserRow | null };

type PostWithComments = ReturnType<typeof postDto> & {
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
    user: ReturnType<typeof publicProfileDto> | null;
  }>;
};

async function fetchPost(id: string): Promise<PostWithComments | null> {
  if (isDemoMode()) return getDemoPost(id) as PostWithComments | null;
  const supabase = createSupabaseServerClient();
  const { data: post } = await supabase.from('posts').select('*, users(*)').eq('id', id).single();
  if (!post) return null;
  const { data: comments } = await supabase
    .from('comments')
    .select('*, users(id, full_name, industry, career_stage, city, country, bio, skills, open_to_opportunities, created_at)')
    .eq('post_id', id)
    .order('created_at');
  return {
    ...postDto(post as unknown as JoinedPost),
    comments: ((comments ?? []) as unknown as JoinedComment[]).map((c) => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at ?? '',
      user: c.users ? publicProfileDto(c.users) : null,
    })),
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await fetchPost(params.id);
  if (!post) return { title: 'Post not found' };
  const title = post.content.slice(0, 60) + (post.content.length > 60 ? '...' : '');
  const authorName = post.user?.full_name ?? 'UmmahConnect member';
  return {
    title,
    description: post.content,
    openGraph: {
      title,
      description: post.content,
      type: 'article',
      authors: [authorName],
    },
  };
}

export default async function PublicPostPage({ params }: PageProps) {
  const [post, user] = await Promise.all([fetchPost(params.id), getSessionUser()]);
  if (!post) notFound();

  return (
    <PublicLayout user={user}>
      <main className="page" style={{ padding: '32px 0' }}>
        <div className="container">
          <Link href="/" className="brand" style={{ display: 'inline-block', marginBottom: 24 }}>
            UmmahConnect
          </Link>
          <article className="card" style={{ padding: 32 }}>
            <div className="row space-between">
              {post.user ? (
                <Link href={`/profiles/${post.user.id}`} style={{ fontWeight: 600 }}>
                  {post.user.full_name}
                </Link>
              ) : (
                <span>Member</span>
              )}
              <small className="muted">{post.created_at.slice(0, 10)}</small>
            </div>
            <p style={{ margin: '16px 0', lineHeight: 1.7, fontSize: 17 }}>{post.content}</p>
            <PostPublicClient postId={post.id} initialLikes={post.likes_count} user={user} />
            <section style={{ marginTop: 32 }}>
              <h2 className="font-display" style={{ fontSize: 24, marginBottom: 16 }}>
                Comments ({post.comments.length})
              </h2>
              <div className="grid" style={{ gap: 12 }}>
                {post.comments.map((comment) => (
                  <div className="card" style={{ padding: 16 }} key={comment.id}>
                    <div className="row space-between">
                      {comment.user ? (
                        <Link href={`/profiles/${comment.user.id}`} style={{ fontWeight: 600 }}>
                          {comment.user.full_name}
                        </Link>
                      ) : (
                        <span>Member</span>
                      )}
                      <small className="muted">{comment.created_at.slice(0, 10)}</small>
                    </div>
                    <p style={{ margin: '8px 0 0' }}>{comment.content}</p>
                  </div>
                ))}
                {post.comments.length === 0 ? <p className="muted">No comments yet.</p> : null}
              </div>
            </section>
          </article>
        </div>
      </main>
    </PublicLayout>
  );
}
