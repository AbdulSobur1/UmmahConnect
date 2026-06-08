import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { connections, users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api/auth';
import { notifyUser } from '@/lib/api/notifications';
import { fail, ok, serverError } from '@/lib/api/response';
import { or, eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const data = await db
      .select()
      .from(connections)
      .where(or(eq(connections.requesterId, auth.userId), eq(connections.receiverId, auth.userId)));
    return ok(data ?? []);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const body = await request.json();
    const receiverId = body?.receiver_id;
    if (!receiverId) return fail('receiver_required', 400);
    const [connection] = await db.insert(connections).values({ requesterId: auth.userId, receiverId }).returning();
    if (!connection) return fail('create_failed', 400);
    const [sender] = await db.select({ fullName: users.fullName }).from(users).where(eq(users.id, auth.userId)).limit(1);
    await notifyUser({ userId: receiverId, type: 'connection', content: `${sender?.fullName ?? 'Someone'} sent you a connection request`, referenceId: connection.id });
    return ok(connection, 201);
  } catch {
    return serverError();
  }
}

