import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { notifyUser } from "@/lib/api/notifications";
import { asRecord, stringValue } from "@/lib/api/parsing";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const status = stringValue(asRecord(await request.json()).status);
    if (status !== "accepted" && status !== "declined") return fail("invalid_status", 400);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("connections").update({ status }).eq("id", params.id).eq("receiver_id", auth.userId).select("*").single();
    if (!data) return fail("not_found", 404);
    if (status === "accepted" && data.requester_id) {
      await notifyUser({ userId: data.requester_id, type: "connection", content: `${auth.profile.full_name} accepted your connection request`, referenceId: data.id });
    }
    return ok(data);
  } catch {
    return serverError();
  }
}
