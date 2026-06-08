import { db } from '@/lib/db';
import { posts, users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api/auth';
import { postDto } from '@/lib/api/mappers';
import { fail, ok, serverError } from '@/lib/api/response';
import { eq, and, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const data = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(and(eq(posts.communityId, params.id), eq(posts.isDeleted, false)))
      .orderBy(desc(posts.createdAt));
    return ok((data ?? []).map((row: any) => postDto({ ...row.posts, users: row.users })));
  } catch {
    return serverError();
  }
}

