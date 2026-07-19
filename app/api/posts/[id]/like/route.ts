import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const supabase = await createClient();

    // Check if like exists
    const { data: existing } = await supabase
      .from("post_likes")
      .select("*")
      .eq("post_id", params.id)
      .eq("user_id", auth.userId)
      .maybeSingle();

    if (existing) {
      // Unlike
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", params.id)
        .eq("user_id", auth.userId);

      const { count } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", params.id);

      await supabase
        .from("posts")
        .update({ likes_count: count ?? 0 })
        .eq("id", params.id);

      return ok({ liked: false, likes_count: count ?? 0 });
    }

    // Like
    await supabase
      .from("post_likes")
      .insert({ post_id: params.id, user_id: auth.userId });

    const { count } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", params.id);

    await supabase
      .from("posts")
      .update({ likes_count: count ?? 0 })
      .eq("id", params.id);

    return ok({ liked: true, likes_count: count ?? 0 });
  } catch {
    return serverError();
  }
}
