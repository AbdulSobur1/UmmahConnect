import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuthWithProfile } from "@/lib/api/auth";
import { notifyUser } from "@/lib/api/notifications";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const result = await requireAuthWithProfile();
    if ("error" in result) return fail("unauthorized", 401);

    const body = await request.json();
    const mentorId =
      typeof body?.mentor_id === "string" ? body.mentor_id : undefined;
    if (!mentorId) return fail("mentor_required", 400);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mentorship_requests")
      .insert({
        mentee_id: result.userId,
        mentor_id: mentorId,
        message: typeof body?.message === "string" ? body.message : null,
      })
      .select()
      .single();

    if (error || !data) return fail("create_failed", 400);

    await notifyUser({
      userId: mentorId,
      type: "mentor",
      content: `${result.profile.full_name} requested mentorship`,
      referenceId: data.id,
    });

    return ok(data, 201);
  } catch {
    return serverError();
  }
}
