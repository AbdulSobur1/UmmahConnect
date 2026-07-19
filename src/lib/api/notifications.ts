import { createServiceClient } from '@/lib/supabase/service';

export async function notifyUser(input: {
  userId: string;
  type: string;
  content: string;
  referenceId?: string;
}) {
  const supabase = createServiceClient();
  const { error } = await supabase.from('notifications').insert({
    user_id: input.userId,
    type: input.type,
    content: input.content,
    reference_id: input.referenceId ?? null,
  });
  if (error) console.error('[notifyUser]', error);
}

export async function notifyUsersByIndustry(industry: string, content: string, referenceId?: string) {
  const supabase = createServiceClient();
  const { data: userList } = await supabase
    .from('users')
    .select('id')
    .eq('industry', industry);
  if (!userList || userList.length === 0) return;
  const { error } = await supabase.from('notifications').insert(
    userList.map((u: any) => ({
      user_id: u.id,
      type: 'job',
      content,
      reference_id: referenceId ?? null,
    }))
  );
  if (error) console.error('[notifyUsersByIndustry]', error);
}

export async function notifyAllUsers(content: string, referenceId?: string) {
  const supabase = createServiceClient();
  const { data: userList } = await supabase.from('users').select('id');
  if (!userList || userList.length === 0) return;
  const chunkSize = 100;
  for (let i = 0; i < userList.length; i += chunkSize) {
    const chunk = userList.slice(i, i + chunkSize);
    const { error } = await supabase.from('notifications').insert(
      chunk.map((u: any) => ({
        user_id: u.id,
        type: 'sponsored',
        content,
        reference_id: referenceId ?? null,
      }))
    );
    if (error) console.error('[notifyAllUsers]', error);
  }
}
