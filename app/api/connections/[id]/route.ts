import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth";
import { notifyUser } from "@/lib/api/notifications";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const body = await request.json();
    const status = body?.status;
    if (status !== "accepted" && status !== "declined") return fail("invalid_status", 400);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("connections")
      .update({ status })
      .eq("id", params.id)
      .eq("receiver_id", auth.userId)
      .select()
      .single();

    if (error || !data) return fail("not_found", 404);

    if (status === "accepted" && data.requester_id) {
      const { data: sender } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", auth.userId)
        .single();

      await notifyUser({
        userId: data.requester_id,
        type: "connection",
        content: `${sender?.full_name ?? "Someone"} accepted your connection request`,
        referenceId: data.id,
      });
    }

    return ok(data);
  } catch {
    return serverError();
  }
}
