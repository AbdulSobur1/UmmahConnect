import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { CommunityPublicClient } from '@/components/public/CommunityPublicClient';
import { communityDto, postDto } from '@/lib/api/mappers';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { communities, posts, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

type PageProps = { params: { id: string } };

async function fetchCommunity(id: string) {
  const [community] = await db
    .select()
    .from(communities)
    .where(eq(communities.id, id))
    .limit(1);
  if (!community) return null;
  const communityData = communityDto({
    id: community.id,
    name: community.name,
    icon: community.icon,
    description: community.description,
    is_private: community.isPrivate,
    member_count: community.memberCount,
    created_at: community.createdAt?.toISOString() ?? null,
  });
  if (community.isPrivate) {
    return { ...communityData, is_private: true as const };
  }
  const postRows = await db
    .select()
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.communityId, id))
    .orderBy(desc(posts.createdAt))
    .limit(20);
  return {
    ...communityData,
    posts: (postRows ?? []).map((row: any) =>
      postDto({ ...row.posts, users: row.users }),
    ),
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
  const communityPosts = 'posts' in community ? community.posts : [];

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
                posts={communityPosts.map((p: any) => ({
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
