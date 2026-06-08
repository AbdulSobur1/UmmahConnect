import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api/auth';
import { getNextPrayer } from '@/lib/api/prayer';
import { fail, ok, serverError } from '@/lib/api/response';
import { eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const [profile] = await db.select({ city: users.city }).from(users).where(eq(users.id, auth.userId)).limit(1);
    return ok(await getNextPrayer(profile?.city ?? 'Lagos'));
  } catch {
    return serverError();
  }
}

