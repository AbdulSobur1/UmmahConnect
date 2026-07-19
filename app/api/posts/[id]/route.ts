import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth";
import { withHandler, ok, err } from "@/lib/api/helpers";
import { postDto, publicProfileDto } from "@/lib/api/mappers";
import { fail, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export const GET = withHandler(async (_req: NextRequest, ctx?: unknown) => {
  const params = (ctx as { params: { id: string } }).params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*, users:user_id(*)")
    .eq("id", params.id)
    .single();

  if (!post || post.is_deleted) {
    return err("Post not found", 404);
  }

  const { data: commentRows } = await supabase
    .from("comments")
    .select("*, users:user_id(*)")
    .eq("post_id", params.id)
    .order("created_at", { ascending: true });

  const commentList = (commentRows ?? []).map((row: any) => ({
    id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    content: row.content,
    created_at: row.created_at ?? "",
    user: row.users ? publicProfileDto(row.users) : null,
  }));

  return ok({
    ...postDto({ ...post, users: post.users } as any),
    comments: commentList,
  });
});

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const supabase = await createClient();
    const { error } = await supabase
      .from("posts")
      .update({ is_deleted: true })
      .eq("id", params.id)
      .eq("user_id", auth.userId);

    if (error) return fail("delete_failed", 400);
    return ok({ deleted: true });
  } catch {
    return serverError();
  }
}
