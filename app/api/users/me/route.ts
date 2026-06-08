import { requireAuth } from '@/lib/api/auth';
import { userDto } from '@/lib/api/mappers';
import { fail, ok, serverError } from '@/lib/api/response';
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const { db } = await import('@/lib/db');
    const { users } = await import('@/lib/db/schema');
    const { eq } = await import('drizzle-orm');
    const [profile] = await db.select().from(users).where(eq(users.id, auth.userId)).limit(1);
    if (!profile) return fail('not_found', 404);
    return ok(userDto(profile as any));
  } catch {
    return serverError();
  }
}
