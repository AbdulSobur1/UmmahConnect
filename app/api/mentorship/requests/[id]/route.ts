import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { db } from '@/lib/db';
import { mentorshipRequests } from '@/lib/db/schema';
import { fail, ok, serverError } from '@/lib/api/response';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const body = await request.json();
    const status = typeof body?.status === 'string' ? body.status : undefined;
    if (status !== 'accepted' && status !== 'declined') return fail('invalid_status', 400);
    const [data] = await db
      .update(mentorshipRequests)
      .set({ status })
      .where(eq(mentorshipRequests.id, params.id))
      .returning();
    return ok(data);
  } catch {
    return serverError();
  }
}
