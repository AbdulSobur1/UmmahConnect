import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api/auth';
import { userDto } from '@/lib/api/mappers';
import { fail, ok, serverError } from '@/lib/api/response';
import { eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const [data] = await db.select().from(users).where(eq(users.id, params.id)).limit(1);
    if (!data) return fail('not_found', 404);
    return ok(userDto(data as any));
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    if (auth.userId !== params.id) return fail('forbidden', 403);
    const body = await request.json();
    const [updated] = await db.update(users).set({
      fullName: body.full_name ?? undefined,
      industry: body.industry ?? undefined,
      careerStage: body.career_stage ?? undefined,
      city: body.city ?? undefined,
      bio: body.bio ?? undefined,
      skills: body.skills ?? undefined,
      showPhoto: body.show_photo ?? undefined,
      openToOpportunities: body.open_to_opportunities ?? undefined,
    }).where(eq(users.id, params.id)).returning();
    if (!updated) return fail('update_failed', 400);
    return ok(userDto(updated as any));
  } catch {
    return serverError();
  }
}

