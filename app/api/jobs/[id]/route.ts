import { NextRequest } from 'next/server';
import { withHandler, ok, err } from '@/lib/api/helpers';
import { jobDto } from '@/lib/api/mappers';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const GET = withHandler(async (_req: NextRequest, ctx?: unknown) => {
  const params = (ctx as { params: { id: string } }).params;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .eq('is_halal_verified', true)
    .single();

  if (error || !data) {
    return err('Job not found', 404);
  }

  return ok(jobDto(data));
});
