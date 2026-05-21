import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ok, serverError } from "@/lib/api/response";

export async function POST() {
  try {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
    return ok({ signed_out: true });
  } catch {
    return serverError();
  }
}
