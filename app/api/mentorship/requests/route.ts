import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { notifyUser } from "@/lib/api/notifications";
import { asRecord, stringValue } from "@/lib/api/parsing";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const body = asRecord(await request.json());
    const mentorId = stringValue(body.mentor_id);
    if (!mentorId) return fail("mentor_required", 400);
    const { data } = await createSupabaseServerClient().from("mentorship_requests").insert({
      mentee_id: auth.userId,
      mentor_id: mentorId,
      message: stringValue(body.message),
    }).select("*").single();
    if (!data) return fail("create_failed", 400);
    await notifyUser({ userId: mentorId, type: "mentor", content: `${auth.profile.full_name} requested mentorship`, referenceId: data.id });
    return ok(data, 201);
  } catch {
    return serverError();
  }
}
