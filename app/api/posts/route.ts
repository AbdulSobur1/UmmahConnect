import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { postDto } from "@/lib/api/mappers";
import { asRecord, stringValue } from "@/lib/api/parsing";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PostRow, UserRow } from "@/lib/supabase/types";

type JoinedPost = PostRow & { users?: UserRow | null };

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("posts").select("*, users(*)").order("created_at", { ascending: false });
    return ok(((data ?? []) as unknown as JoinedPost[]).map(postDto));
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const body = asRecord(await request.json());
    const content = stringValue(body.content);
    if (!content) return fail("content_required", 400);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("posts").insert({
      user_id: auth.userId,
      content,
      community_id: stringValue(body.community_id) ?? null,
    }).select("*, users(*)").single();
    if (!data) return fail("create_failed", 400);
    return ok(postDto(data as unknown as JoinedPost), 201);
  } catch {
    return serverError();
  }
}
