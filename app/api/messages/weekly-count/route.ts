import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth";
import { mondayWeekStart } from "@/lib/api/business";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const weekStart = mondayWeekStart();
    const supabase = await createClient();

    const { data } = await supabase
      .from("message_weekly_counts")
      .select("*")
      .eq("user_id", auth.userId)
      .eq("week_start", weekStart)
      .maybeSingle();

    const count = (data as { count?: number })?.count ?? 0;
    return ok({
      week_start: weekStart,
      count,
      remaining: Math.max(0, 10 - count),
    });
  } catch {
    return serverError();
  }
}
