import { NextRequest } from 'next/server';
import { requireAuth, requireAuthWithProfile } from '@/lib/api/auth';
import { db } from '@/lib/db';
import { mentorshipProfiles, users } from '@/lib/db/schema';
import { fail, ok, serverError } from '@/lib/api/response';
import { eq } from 'drizzle-orm';
import { asRecord, stringArrayValue, stringValue } from '@/lib/api/parsing';

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const data = await db
      .select()
      .from(mentorshipProfiles)
      .leftJoin(users, eq(mentorshipProfiles.userId, users.id));
    return ok((data ?? []).map((row: any) => ({
      user_id: row.mentorship_profiles.userId,
      full_name: row.users?.fullName ?? '',
      role: row.users?.industry ?? row.mentorship_profiles.role ?? 'Mentor',
      city: row.users?.city ?? '',
      match_score: 0,
      industries: row.mentorship_profiles.industries ?? [],
      values_tags: row.mentorship_profiles.valuesTags ?? [],
      bio: row.mentorship_profiles.bio ?? '',
    })));
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await requireAuthWithProfile();
    if ('error' in result) return fail('unauthorized', 401);
    const body = asRecord(await request.json());
    const requestedRole = stringValue(body.role);
    const role = requestedRole === 'mentor' || requestedRole === 'both' || requestedRole === 'mentee' ? requestedRole : 'mentee';
    const [data] = await db
      .insert(mentorshipProfiles)
      .values({
        userId: result.userId,
        role,
        industries: stringArrayValue(body.industries) ?? [],
        languages: stringArrayValue(body.languages) ?? ['English'],
        valuesTags: stringArrayValue(body.values_tags) ?? [],
        careerStage: stringValue(body.career_stage) ?? (result.profile.careerStage ?? null),
        bio: stringValue(body.bio) ?? '',
        yearsExperience: Number(body.years_experience ?? 0),
      })
      .onConflictDoUpdate({
        target: mentorshipProfiles.userId,
        set: {
          role,
          industries: stringArrayValue(body.industries) ?? [],
          languages: stringArrayValue(body.languages) ?? ['English'],
          valuesTags: stringArrayValue(body.values_tags) ?? [],
          careerStage: stringValue(body.career_stage) ?? (result.profile.careerStage ?? null),
          bio: stringValue(body.bio) ?? '',
          yearsExperience: Number(body.years_experience ?? 0),
        },
      })
      .returning();
    return ok(data);
  } catch {
    return serverError();
  }
}
