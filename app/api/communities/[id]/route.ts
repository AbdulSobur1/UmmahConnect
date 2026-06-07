import { NextRequest } from 'next/server';
import { withHandler, ok, err } from '@/lib/api/helpers';
import { communityDto, postDto } from '@/lib/api/mappers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { PostRow, UserRow } from '@/lib/supabase/types';

type JoinedPost = PostRow & { users?: UserRow | null };

export const GET = withHandler(async (_req: NextRequest, ctx?: unknown) => {
  const params = (ctx as { params: { id: string } }).params;
  const supabase = createSupabaseServerClient();
  const { data: community, error } = await supabase
    .from('communities')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !community) {
    return err('Community not found', 404);
  }

  if (community.is_private) {
    return ok({
      ...communityDto(community),
      is_private: true,
    });
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*, users(*)')
    .eq('community_id', params.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return ok({
    ...communityDto(community),
    posts: ((posts ?? []) as unknown as JoinedPost[]).map(postDto),
  });
});
