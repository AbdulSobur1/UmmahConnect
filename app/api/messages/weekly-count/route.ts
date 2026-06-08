import { db } from '@/lib/db';
import { messageWeeklyCounts } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api/auth';
import { mondayWeekStart } from '@/lib/api/business';
import { fail, ok, serverError } from '@/lib/api/response';
import { and, eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const weekStart = mondayWeekStart();
    const [data] = await db.select().from(messageWeeklyCounts).where(and(eq(messageWeeklyCounts.userId, auth.userId), eq(messageWeeklyCounts.weekStart, weekStart))).limit(1);
    return ok({ week_start: weekStart, count: data?.count ?? 0, remaining: Math.max(0, 10 - (data?.count ?? 0)) });
  } catch {
    return serverError();
  }
}

