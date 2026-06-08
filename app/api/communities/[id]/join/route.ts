import { db } from '@/lib/db';
import { communityMembers } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api/auth';
import { fail, ok, serverError } from '@/lib/api/response';
import { and, eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    await db.insert(communityMembers).values({ communityId: params.id, userId: auth.userId }).onConflictDoNothing();
    return ok({ joined: true });
  } catch {
    return serverError();
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    await db.delete(communityMembers).where(and(eq(communityMembers.communityId, params.id), eq(communityMembers.userId, auth.userId)));
    return ok({ joined: false });
  } catch {
    return serverError();
  }
}

