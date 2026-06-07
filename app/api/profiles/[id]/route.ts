import { NextRequest } from 'next/server';
import { withHandler, ok, err } from '@/lib/api/helpers';
import { publicProfileDto } from '@/lib/api/mappers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { UserRow } from '@/lib/supabase/types';

type UserWithBan = UserRow & { is_banned?: boolean | null };

export const GET = withHandler(async (_req: NextRequest, ctx?: unknown) => {
  const params = (ctx as { params: { id: string } }).params;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, industry, career_stage, city, country, bio, skills, open_to_opportunities, created_at')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return err('Profile not found', 404);
  }

  const profile = data as UserWithBan;
  if (profile.is_banned) {
    return err('Profile not found', 404);
  }

  return ok(publicProfileDto(profile));
});
