import { requireAuth } from "@/lib/api/auth";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${auth.userId},receiver_id.eq.${auth.userId}`)
      .order("created_at", { ascending: false });
    return ok(data ?? []);
  } catch {
    return serverError();
  }
}

