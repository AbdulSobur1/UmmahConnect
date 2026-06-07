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
  const title = `${community.name} — Muslim Professionals on UmmahConnect`;
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
      <main className="page" style={{ padding: '32px 0' }}>
        <div className="container">
          <Link href="/" className="brand" style={{ display: 'inline-block', marginBottom: 24 }}>
            UmmahConnect
          </Link>
          <article className="card" style={{ padding: 32 }}>
            <div className="row" style={{ gap: 16, alignItems: 'center' }}>
              <span
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: '#132420',
                  color: '#C9A84C',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {community.icon || community.name.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <h1 className="font-display" style={{ fontSize: 36, margin: 0 }}>{community.name}</h1>
                <p className="muted" style={{ margin: '4px 0 0' }}>
                  {community.member_count.toLocaleString()} members
                </p>
              </div>
            </div>
            <p style={{ marginTop: 20, lineHeight: 1.6 }}>{community.description}</p>
            {isPrivate ? (
              <p className="muted" style={{ marginTop: 20 }}>
                This is a private community. Join UmmahConnect to request access.
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
