import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getSessionUser(): Promise<{ id: string } | null> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { id: user.id } : null;
}
