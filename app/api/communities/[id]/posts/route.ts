import { requireAuth } from "@/lib/api/auth";
import { postDto } from "@/lib/api/mappers";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PostRow, UserRow } from "@/lib/supabase/types";
export const dynamic = 'force-dynamic'

type JoinedPost = PostRow & { users?: UserRow | null };

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("posts").select("*, users(*)").eq("community_id", params.id).order("created_at", { ascending: false });
    return ok(((data ?? []) as unknown as JoinedPost[]).map(postDto));
  } catch {
    return serverError();
  }
}

