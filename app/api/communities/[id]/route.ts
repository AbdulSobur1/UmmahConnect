import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { communities, posts, users } from '@/lib/db/schema';
import { withHandler, ok, err } from '@/lib/api/helpers';
import { communityDto, postDto } from '@/lib/api/mappers';
import { eq, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

export const GET = withHandler(async (_req: NextRequest, ctx?: unknown) => {
  const params = (ctx as { params: { id: string } }).params;
  const [community] = await db
    .select()
    .from(communities)
    .where(eq(communities.id, params.id))
    .limit(1);

  if (!community) {
    return err('Community not found', 404);
  }

  if (community.isPrivate) {
    return ok({
      ...communityDto(community as any),
      is_private: true,
    });
  }

  const postRows = await db
    .select()
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.communityId, params.id))
    .orderBy(desc(posts.createdAt))
    .limit(20);

  return ok({
    ...communityDto(community as any),
    posts: (postRows ?? []).map((row: any) => postDto({ ...row.posts, users: row.users })),
  });
});

