import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { withHandler, ok, err } from '@/lib/api/helpers';
import { jobDto } from '@/lib/api/mappers';
import { notifyUsersByIndustry } from '@/lib/api/notifications';
import { asRecord, booleanValue, stringValue } from '@/lib/api/parsing';
import { fail, serverError } from '@/lib/api/response';
import { createSupabaseServerClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic'

export const GET = withHandler(async (request: NextRequest) => {
  const supabase = createSupabaseServerClient();
  const industry = request.nextUrl.searchParams.get('industry');
  const isRemoteParam = request.nextUrl.searchParams.get('is_remote');
  const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') ?? '1'));
  const limit = Math.min(20, Math.max(1, Number(request.nextUrl.searchParams.get('limit') ?? '20')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .eq('is_halal_verified', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (industry) {
    query = query.eq('industry', industry);
  }
  if (isRemoteParam === 'true') {
    query = query.eq('is_remote', true);
  } else if (isRemoteParam === 'false') {
    query = query.eq('is_remote', false);
  }

  const { data, error } = await query;
  if (error) {
    return err('Could not load jobs', 500);
  }

  return ok((data ?? []).map(jobDto));
});

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    if (auth.profile.plan !== 'pro') return fail('pro_required', 403, { feature: 'job_posting' });
    const body = asRecord(await request.json());
    if (booleanValue(body.halal_confirmed) !== true) return fail('halal_confirmation_required', 400);
    const title = stringValue(body.title);
    const company = stringValue(body.company);
    if (!title || !company) return fail('missing_fields', 400);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('jobs').insert({
      posted_by: auth.userId,
      title,
      company,
      description: stringValue(body.description),
      industry: stringValue(body.industry),
      location: stringValue(body.location),
      is_remote: booleanValue(body.is_remote) ?? false,
      job_type: stringValue(body.job_type),
      career_stage: stringValue(body.career_stage),
      salary_range: stringValue(body.salary_range),
      is_halal_verified: true,
    }).select('*').single();
    if (!data) return fail('create_failed', 400);
    if (data.industry) await notifyUsersByIndustry(data.industry, `New job match: ${data.title} at ${data.company}`, data.id);
    return ok(jobDto(data), 201);
  } catch {
    return serverError();
  }
}

