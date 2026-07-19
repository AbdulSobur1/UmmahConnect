import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireAuthWithProfile } from "@/lib/api/auth";
import { postDto } from "@/lib/api/mappers";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail("unauthorized", 401);

    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("*, users:user_id(*)")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    return ok((data ?? []).map((row: any) => postDto({ ...row, users: row.users })));
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await requireAuthWithProfile();
    if ("error" in result) return fail("unauthorized", 401);

    const body = await request.json();
    const content =
      typeof body?.content === "string" && body.content.trim().length > 0
        ? body.content.trim()
        : undefined;
    if (!content) return fail("content_required", 400);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: result.userId,
        content,
        community_id: typeof body.community_id === "string" ? body.community_id : null,
      })
      .select()
      .single();

    if (error || !data) return fail("create_failed", 400);
    const fullPost = { ...data, users: result.profile };
    return ok(postDto(fullPost as any), 201);
  } catch {
    return serverError();
  }
}
