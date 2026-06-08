import { db } from '@/lib/db';
import { notifications as notificationsTable } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api/auth';
import { fail, ok, serverError } from '@/lib/api/response';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic'

export async function PATCH() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, auth.userId));
    return ok({ read: true });
  } catch {
    return serverError();
  }
}
