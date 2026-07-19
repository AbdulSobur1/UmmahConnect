import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth";
import { getNextPrayer } from "@/lib/api/prayer";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("users")
      .select("city")
      .eq("id", auth.userId)
      .single();

    return ok(await getNextPrayer(profile?.city ?? "Lagos"));
  } catch {
    return serverError();
  }
}
