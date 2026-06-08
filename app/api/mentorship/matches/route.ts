import { requireAuthWithProfile } from '@/lib/api/auth';
import { scoreMentor } from '@/lib/api/business';
import { db } from '@/lib/db';
import { mentorshipProfiles, users } from '@/lib/db/schema';
import { fail, ok, serverError } from '@/lib/api/response';
import { eq, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await requireAuthWithProfile();
    if ('error' in result) return fail('unauthorized', 401);
    if (result.plan !== 'pro') return fail('pro_required', 403, { feature: 'mentorship_matches' });

    const mentors = await db
      .select()
      .from(mentorshipProfiles)
      .leftJoin(users, eq(mentorshipProfiles.userId, users.id))
      .where(inArray(mentorshipProfiles.role, ['mentor', 'both']));

    const matches = (mentors ?? [])
      .filter((row: any) => row.mentorship_profiles.userId !== result.userId)
      .map((row: any) => ({
        user_id: row.mentorship_profiles.userId,
        full_name: row.users?.fullName ?? '',
        role: row.users?.industry ?? 'Mentor',
        city: row.users?.city ?? '',
        match_score: scoreMentor(result.profile as any, row.mentorship_profiles as any),
        industries: row.mentorship_profiles.industries ?? [],
        values_tags: row.mentorship_profiles.valuesTags ?? [],
        bio: row.mentorship_profiles.bio ?? '',
      }))
      .sort((a: any, b: any) => b.match_score - a.match_score);

    return ok(matches);
  } catch {
    return serverError();
  }
}
