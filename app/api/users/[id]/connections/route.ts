import { db } from '@/lib/db';
import { connections } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api/auth';
import { fail, ok, serverError } from '@/lib/api/response';
import { or, eq, and } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const data = await db
      .select()
      .from(connections)
      .where(and(or(eq(connections.requesterId, params.id), eq(connections.receiverId, params.id)), eq(connections.status, 'accepted')));
    return ok(data ?? []);
  } catch {
    return serverError();
  }
}

