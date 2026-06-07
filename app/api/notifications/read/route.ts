import { requireAuth } from "@/lib/api/auth";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export const dynamic = 'force-dynamic'

export async function PATCH() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    await createSupabaseServerClient().from("notifications").update({ is_read: true }).eq("user_id", auth.userId);
    return ok({ read: true });
  } catch {
    return serverError();
  }
}

