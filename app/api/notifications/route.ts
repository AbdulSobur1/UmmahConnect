import { db } from '@/lib/db';
import { notifications as notificationsTable } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api/auth';
import { notificationDto } from '@/lib/api/mappers';
import { fail, ok, serverError } from '@/lib/api/response';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const data = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, auth.userId))
      .orderBy(desc(notificationsTable.createdAt));
    return ok((data ?? []).map(notificationDto as any));
  } catch {
    return serverError();
  }
}
