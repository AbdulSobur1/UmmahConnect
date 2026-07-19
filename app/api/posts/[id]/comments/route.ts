import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const supabase = await createClient();
    const { data } = await supabase
      .from("comments")
      .select("*, users:user_id(*)")
      .eq("post_id", params.id)
      .order("created_at", { ascending: true });

    return ok(data ?? []);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const body = await request.json();
    const content = body?.content;
    if (!content) return fail("content_required", 400);

    const supabase = await createClient();

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({ post_id: params.id, user_id: auth.userId, content })
      .select()
      .single();

    if (error || !comment) return fail("create_failed", 400);

    // Update comment count
    const { count } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", params.id);

    await supabase
      .from("posts")
      .update({ comments_count: count ?? 0 })
      .eq("id", params.id);

    return ok(comment, 201);
  } catch {
    return serverError();
  }
}
