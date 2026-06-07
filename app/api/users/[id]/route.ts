import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { userDto } from "@/lib/api/mappers";
import { asRecord, booleanValue, stringArrayValue, stringValue } from "@/lib/api/parsing";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export const dynamic = 'force-dynamic'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("users").select("*").eq("id", params.id).single();
    if (!data) return fail("not_found", 404);
    return ok(userDto(data));
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    if (auth.userId !== params.id) return fail("forbidden", 403);
    const body = asRecord(await request.json());
    const update = {
      full_name: stringValue(body.full_name),
      industry: stringValue(body.industry),
      career_stage: stringValue(body.career_stage),
      city: stringValue(body.city),
      country: stringValue(body.country),
      bio: stringValue(body.bio),
      skills: stringArrayValue(body.skills),
      show_photo: booleanValue(body.show_photo),
      open_to_opportunities: booleanValue(body.open_to_opportunities),
    };
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("users").update(update).eq("id", params.id).select("*").single();
    if (!data) return fail("update_failed", 400);
    return ok(userDto(data));
  } catch {
    return serverError();
  }
}

