import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { withHandler, ok, err } from '@/lib/api/helpers';
import { postDto, publicProfileDto } from '@/lib/api/mappers';
import { fail, serverError } from '@/lib/api/response';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { CommentRow, PostRow, UserRow } from '@/lib/supabase/types';
export const dynamic = 'force-dynamic'

type JoinedPost = PostRow & { users?: UserRow | null };
type JoinedComment = CommentRow & { users?: UserRow | null };

function commentDto(comment: JoinedComment) {
  return {
    id: comment.id,
    post_id: comment.post_id,
    user_id: comment.user_id,
    content: comment.content,
    created_at: comment.created_at ?? '',
    user: comment.users ? publicProfileDto(comment.users) : null,
  };
}

export const GET = withHandler(async (_req: NextRequest, ctx?: unknown) => {
  const params = (ctx as { params: { id: string } }).params;
  const supabase = createSupabaseServerClient();
  const { data: post, error } = await supabase
    .from('posts')
    .select('*, users(*)')
    .eq('id', params.id)
    .single();

  if (error || !post) {
    return err('Post not found', 404);
  }

  const postRecord = post as JoinedPost & { is_deleted?: boolean };
  if (postRecord.is_deleted) {
    return err('Post not found', 404);
  }

  const { data: comments } = await supabase
    .from('comments')
    .select('*, users(id, full_name, industry, career_stage, city, country, bio, skills, open_to_opportunities, created_at)')
    .eq('post_id', params.id)
    .order('created_at');

  return ok({
    ...postDto(post as unknown as JoinedPost),
    comments: ((comments ?? []) as unknown as JoinedComment[]).map(commentDto),
  });
});

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const supabase = createSupabaseServerClient();
    await supabase.from('posts').delete().eq('id', params.id).eq('user_id', auth.userId);
    return ok({ deleted: true });
  } catch {
    return serverError();
  }
}

