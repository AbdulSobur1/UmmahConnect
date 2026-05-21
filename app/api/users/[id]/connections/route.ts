import { requireAuth } from "@/lib/api/auth";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("connections")
      .select("*")
      .or(`requester_id.eq.${params.id},receiver_id.eq.${params.id}`)
      .eq("status", "accepted");
    return ok(data ?? []);
  } catch {
    return serverError();
  }
}
