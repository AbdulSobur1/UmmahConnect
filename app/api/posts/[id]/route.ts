import { requireAuth } from "@/lib/api/auth";
import { postDto } from "@/lib/api/mappers";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PostRow, UserRow } from "@/lib/supabase/types";

type JoinedPost = PostRow & { users?: UserRow | null };

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("posts").select("*, users(*)").eq("id", params.id).single();
    if (!data) return fail("not_found", 404);
    return ok(postDto(data as unknown as JoinedPost));
  } catch {
    return serverError();
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const supabase = createSupabaseServerClient();
    await supabase.from("posts").delete().eq("id", params.id).eq("user_id", auth.userId);
    return ok({ deleted: true });
  } catch {
    return serverError();
  }
}
