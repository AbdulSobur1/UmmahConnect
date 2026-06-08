import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api/auth';
import { fail, ok, serverError } from '@/lib/api/response';
import { and, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic'

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, params.id), eq(notifications.userId, auth.userId)));
    return ok({ read: true });
  } catch {
    return serverError();
  }
}
