import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { asRecord, stringValue } from "@/lib/api/parsing";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export const dynamic = 'force-dynamic'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("comments").select("*, users(*)").eq("post_id", params.id).order("created_at");
    return ok(data ?? []);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const content = stringValue(asRecord(await request.json()).content);
    if (!content) return fail("content_required", 400);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("comments").insert({ post_id: params.id, user_id: auth.userId, content }).select("*").single();
    const { count } = await supabase.from("comments").select("*", { count: "exact", head: true }).eq("post_id", params.id);
    await supabase.from("posts").update({ comments_count: count ?? 0 }).eq("id", params.id);
    return ok(data, 201);
  } catch {
    return serverError();
  }
}

