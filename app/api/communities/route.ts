import { db } from '@/lib/db';
import { communities } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api/auth';
import { communityDto } from '@/lib/api/mappers';
import { fail, ok, serverError } from '@/lib/api/response';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const allCommunities = await db
      .select()
      .from(communities)
      .orderBy(desc(communities.memberCount));
    const filtered = auth.plan === 'free'
      ? allCommunities.filter((c) => !c.isPrivate)
      : allCommunities;
    return ok(filtered.map(communityDto as any));
  } catch {
    return serverError();
  }
}
