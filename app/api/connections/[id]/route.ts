import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { connections, users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api/auth';
import { notifyUser } from '@/lib/api/notifications';
import { fail, ok, serverError } from '@/lib/api/response';
import { and, eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const body = await request.json();
    const status = body?.status;
    if (status !== 'accepted' && status !== 'declined') return fail('invalid_status', 400);
    const [data] = await db.update(connections).set({ status }).where(and(eq(connections.id, params.id), eq(connections.receiverId, auth.userId))).returning();
    if (!data) return fail('not_found', 404);
    if (status === 'accepted' && data.requesterId) {
      const [sender] = await db.select({ fullName: users.fullName }).from(users).where(eq(users.id, auth.userId)).limit(1);
      await notifyUser({ userId: data.requesterId, type: 'connection', content: `${sender?.fullName ?? 'Someone'} accepted your connection request`, referenceId: data.id });
    }
    return ok(data);
  } catch {
    return serverError();
  }
}

