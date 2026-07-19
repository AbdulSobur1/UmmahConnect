import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const supabase = await createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", params.id)
      .eq("user_id", auth.userId);

    if (error) return fail("update_failed", 400);
    return ok({ read: true });
  } catch {
    return serverError();
  }
}
