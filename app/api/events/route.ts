import { withHandler, ok, err } from '@/lib/api/helpers';
import { eventDto } from '@/lib/api/mappers';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const GET = withHandler(async () => {
  const today = new Date().toISOString().slice(0, 10);
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('event_listings')
    .select('*')
    .eq('is_active', true)
    .gte('event_date', today)
    .order('event_date');

  if (error) {
    return err('Could not load events', 500);
  }

  return ok((data ?? []).map(eventDto));
});
