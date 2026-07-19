import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth";
import { notifyUser } from "@/lib/api/notifications";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const supabase = await createClient();
    const { data } = await supabase
      .from("connections")
      .select("*")
      .or(`requester_id.eq.${auth.userId},receiver_id.eq.${auth.userId}`);

    return ok(data ?? []);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const body = await request.json();
    const receiverId = body?.receiver_id;
    if (!receiverId) return fail("receiver_required", 400);

    const supabase = await createClient();
    const { data: connection, error } = await supabase
      .from("connections")
      .insert({ requester_id: auth.userId, receiver_id: receiverId })
      .select()
      .single();

    if (error || !connection) return fail("create_failed", 400);

    const { data: sender } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", auth.userId)
      .single();

    await notifyUser({
      userId: receiverId,
      type: "connection",
      content: `${sender?.full_name ?? "Someone"} sent you a connection request`,
      referenceId: connection.id,
    });

    return ok(connection, 201);
  } catch {
    return serverError();
  }
}
