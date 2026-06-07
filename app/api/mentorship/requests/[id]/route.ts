import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { asRecord, stringValue } from "@/lib/api/parsing";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const status = stringValue(asRecord(await request.json()).status);
    if (status !== "accepted" && status !== "declined") return fail("invalid_status", 400);
    const { data } = await createSupabaseServerClient().from("mentorship_requests").update({ status }).eq("id", params.id).eq("mentor_id", auth.userId).select("*").single();
    return ok(data);
  } catch {
    return serverError();
  }
}

