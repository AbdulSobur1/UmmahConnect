import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { messages, messageWeeklyCounts, users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api/auth';
import { mondayWeekStart } from '@/lib/api/business';
import { messageDto } from '@/lib/api/mappers';
import { notifyUser } from '@/lib/api/notifications';
import { fail, ok, serverError } from '@/lib/api/response';
import { and, or, eq, asc } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

export async function GET(_: Request, { params }: { params: { userId: string } }) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const data = await db
      .select()
      .from(messages)
      .where(or(
        and(eq(messages.senderId, auth.userId), eq(messages.receiverId, params.userId)),
        and(eq(messages.senderId, params.userId), eq(messages.receiverId, auth.userId))
      ))
      .orderBy(asc(messages.createdAt));
    return ok((data ?? []).map(messageDto as any));
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const body = await request.json();
    const content = body?.content;
    if (!content) return fail('content_required', 400);
    const weekStart = mondayWeekStart();
    const [current] = await db.select().from(messageWeeklyCounts).where(and(eq(messageWeeklyCounts.userId, auth.userId), eq(messageWeeklyCounts.weekStart, weekStart))).limit(1);
    const count = current?.count ?? 0;
    if (auth.plan === 'free' && count >= 10) return fail('weekly_limit_reached', 403);
    const [message] = await db.insert(messages).values({ senderId: auth.userId, receiverId: params.userId, content }).returning();
    if (!message) return fail('send_failed', 400);
    await db.insert(messageWeeklyCounts).values({ userId: auth.userId, weekStart, count: count + 1 }).onConflictDoUpdate({ target: [messageWeeklyCounts.userId, messageWeeklyCounts.weekStart], set: { count: count + 1 } });
    const [sender] = await db.select({ fullName: users.fullName }).from(users).where(eq(users.id, auth.userId)).limit(1);
    await notifyUser({ userId: params.userId, type: 'message', content: `New message from ${sender?.fullName ?? 'Someone'}`, referenceId: message.id });
    return ok({ message: messageDto(message as any), weekly_count: count + 1 }, 201);
  } catch {
    return serverError();
  }
}

