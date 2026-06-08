import { NextRequest } from 'next/server';
import { requireAuthWithProfile } from '@/lib/api/auth';
import { notifyUser } from '@/lib/api/notifications';
import { db } from '@/lib/db';
import { mentorshipRequests } from '@/lib/db/schema';
import { fail, ok, serverError } from '@/lib/api/response';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const result = await requireAuthWithProfile();
    if ('error' in result) return fail('unauthorized', 401);
    const body = await request.json();
    const mentorId = typeof body?.mentor_id === 'string' ? body.mentor_id : undefined;
    if (!mentorId) return fail('mentor_required', 400);
    const [data] = await db
      .insert(mentorshipRequests)
      .values({
        menteeId: result.userId,
        mentorId,
        message: typeof body?.message === 'string' ? body.message : null,
      })
      .returning();
    if (!data) return fail('create_failed', 400);
    await notifyUser({ userId: mentorId, type: 'mentor', content: `${result.profile.fullName} requested mentorship`, referenceId: data.id });
    return ok(data, 201);
  } catch {
    return serverError();
  }
}
