import { requireAuth } from "@/lib/api/auth";
import { mondayWeekStart } from "@/lib/api/business";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const weekStart = mondayWeekStart();
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("message_weekly_counts").select("*").eq("user_id", auth.userId).eq("week_start", weekStart).maybeSingle();
    return ok({ week_start: weekStart, count: data?.count ?? 0, remaining: Math.max(0, 10 - (data?.count ?? 0)) });
  } catch {
    return serverError();
  }
}
