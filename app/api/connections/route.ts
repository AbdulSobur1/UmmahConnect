import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { notifyUser } from "@/lib/api/notifications";
import { asRecord, stringValue } from "@/lib/api/parsing";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("connections").select("*").or(`requester_id.eq.${auth.userId},receiver_id.eq.${auth.userId}`);
    return ok(data ?? []);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const receiverId = stringValue(asRecord(await request.json()).receiver_id);
    if (!receiverId) return fail("receiver_required", 400);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("connections").insert({ requester_id: auth.userId, receiver_id: receiverId }).select("*").single();
    if (!data) return fail("create_failed", 400);
    await notifyUser({ userId: receiverId, type: "connection", content: `${auth.profile.full_name} sent you a connection request`, referenceId: data.id });
    return ok(data, 201);
  } catch {
    return serverError();
  }
}
