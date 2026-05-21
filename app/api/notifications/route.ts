import { requireAuth } from "@/lib/api/auth";
import { notificationDto } from "@/lib/api/mappers";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const { data } = await createSupabaseServerClient().from("notifications").select("*").eq("user_id", auth.userId).order("created_at", { ascending: false });
    return ok((data ?? []).map(notificationDto));
  } catch {
    return serverError();
  }
}
