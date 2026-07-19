import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth";
import { notificationDto } from "@/lib/api/mappers";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const supabase = await createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: false });

    return ok((data ?? []).map(notificationDto as any));
  } catch {
    return serverError();
  }
}
