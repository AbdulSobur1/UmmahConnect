import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth";
import { userDto } from "@/lib/api/mappers";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const supabase = await createClient();
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!data) return fail("not_found", 404);
    return ok(userDto(data as any));
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    if (auth.userId !== params.id) return fail("forbidden", 403);

    const body = await request.json();
    const update: Record<string, unknown> = {};
    if (body.full_name !== undefined) update.full_name = body.full_name;
    if (body.industry !== undefined) update.industry = body.industry;
    if (body.career_stage !== undefined) update.career_stage = body.career_stage;
    if (body.city !== undefined) update.city = body.city;
    if (body.bio !== undefined) update.bio = body.bio;
    if (body.skills !== undefined) update.skills = body.skills;
    if (body.show_photo !== undefined) update.show_photo = body.show_photo;
    if (body.open_to_opportunities !== undefined) update.open_to_opportunities = body.open_to_opportunities;
    if (body.banner_url !== undefined) update.banner_url = body.banner_url;
    if (body.avatar_url !== undefined) update.avatar_url = body.avatar_url;
    update.updated_at = new Date().toISOString();

    const supabase = await createClient();
    const { data: updated } = await supabase
      .from("users")
      .update(update)
      .eq("id", params.id)
      .select()
      .single();

    if (!updated) return fail("update_failed", 400);
    return ok(userDto(updated as any));
  } catch {
    return serverError();
  }
}
