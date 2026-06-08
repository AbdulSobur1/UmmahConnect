import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { jobs } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api/auth';
import { jobDto } from '@/lib/api/mappers';
import { notifyUsersByIndustry } from '@/lib/api/notifications';
import { fail, ok, serverError } from '@/lib/api/response';
import { and, eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const industry = request.nextUrl.searchParams.get('industry');
    const isRemoteParam = request.nextUrl.searchParams.get('is_remote');
    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') ?? '1'));
    const limit = Math.min(20, Math.max(1, Number(request.nextUrl.searchParams.get('limit') ?? '20')));

    let conditions = and(
      eq(jobs.isActive, true),
      eq(jobs.isHalalVerified, true)
    ) as any;

    if (industry) {
      conditions = and(conditions, eq(jobs.industry, industry)) as any;
    }
    if (isRemoteParam === 'true') {
      conditions = and(conditions, eq(jobs.isRemote, true)) as any;
    } else if (isRemoteParam === 'false') {
      conditions = and(conditions, eq(jobs.isRemote, false)) as any;
    }

    const data = await db
      .select()
      .from(jobs)
      .where(conditions)
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return ok((data ?? []).map(jobDto as any));
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    if (auth.plan !== 'pro') return fail('pro_required', 403);
    const body = await request.json();
    if (!body.halal_confirmed) return fail('halal_confirmation_required', 400);
    if (!body.title || !body.company) return fail('missing_fields', 400);
    const [job] = await db.insert(jobs).values({
      postedBy: auth.userId,
      title: body.title,
      company: body.company,
      description: body.description ?? null,
      industry: body.industry ?? null,
      location: body.location ?? null,
      isRemote: body.is_remote ?? false,
      jobType: body.job_type ?? null,
      careerStage: body.career_stage ?? null,
      salaryRange: body.salary_range ?? null,
      isHalalVerified: true,
    }).returning();
    if (!job) return fail('create_failed', 400);
    if (job.industry) await notifyUsersByIndustry(job.industry, `New job match: ${job.title} at ${job.company}`, job.id);
    return ok(jobDto(job as any), 201);
  } catch {
    return serverError();
  }
}
