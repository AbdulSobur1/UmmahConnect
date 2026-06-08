import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { CommunityPublicClient } from '@/components/public/CommunityPublicClient';
import { communityDto, postDto } from '@/lib/api/mappers';
import { getSessionUser } from '@/lib/auth/session';
import { getDemoCommunity, isDemoMode } from '@/lib/demo/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { PostRow, UserRow } from '@/lib/supabase/types';

type PageProps = { params: { id: string } };
type JoinedPost = PostRow & { users?: UserRow | null };

async function fetchCommunity(id: string) {
  if (isDemoMode()) return getDemoCommunity(id);
  const supabase = createSupabaseServerClient();
  const { data: community } = await supabase.from('communities').select('*').eq('id', id).single();
  if (!community) return null;
  if (community.is_private) {
    return { ...communityDto(community), is_private: true as const };
  }
  const { data: posts } = await supabase
    .from('posts')
    .select('*, users(*)')
    .eq('community_id', id)
    .order('created_at', { ascending: false })
    .limit(20);
  return {
    ...communityDto(community),
    posts: ((posts ?? []) as unknown as JoinedPost[]).map(postDto),
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const community = await fetchCommunity(params.id);
  if (!community) return { title: 'Community not found' };
  const title = `${community.name} — Muslim Professionals on Ummah Connect`;
  return {
    title,
    description: community.description,
    openGraph: { title, description: community.description },
  };
}

export default async function PublicCommunityPage({ params }: PageProps) {
  const [community, user] = await Promise.all([fetchCommunity(params.id), getSessionUser()]);
  if (!community) notFound();

  const isPrivate = 'is_private' in community && community.is_private === true;
  const posts = 'posts' in community ? community.posts : [];

  return (
    <PublicLayout user={user}>
      <main className="page">
        <div className="container">
          <Link href="/" className="brand public-brand">
            Ummah <span>Connect</span>
          </Link>
          <article className="card public-card public-community-card">
            <div className="row row--center public-hero-row">
              <span className="community-avatar">
                {community.icon || community.name.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <h1 className="font-display">{community.name}</h1>
                <p className="muted public-copy">
                  {community.member_count.toLocaleString()} members
                </p>
              </div>
            </div>
            <p className="public-text">{community.description}</p>
            {isPrivate ? (
              <p className="muted public-copy">
                This is a private community. Join Ummah Connect to request access.
              </p>
            ) : (
              <CommunityPublicClient
                communityId={community.id}
                posts={posts.map((p) => ({
                  id: p.id,
                  content: p.content,
                  likes_count: p.likes_count,
                  comments_count: p.comments_count,
                  created_at: p.created_at,
                  user: p.user ? { id: p.user.id, full_name: p.user.full_name } : null,
                }))}
                user={user}
              />
            )}
          </article>
        </div>
      </main>
    </PublicLayout>
  );
}
