import { createClient } from "@/lib/supabase/server";
import { requireAuthWithProfile } from "@/lib/api/auth";
import { scoreMentor } from "@/lib/api/business";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await requireAuthWithProfile();
    if ("error" in result) return fail("unauthorized", 401);
    if (result.plan !== "pro")
      return fail("pro_required", 403, { feature: "mentorship_matches" });

    const supabase = await createClient();
    const { data: mentors } = await supabase
      .from("mentorship_profiles")
      .select("*, users:user_id(*)")
      .in("role", ["mentor", "both"]);

    const matches = (mentors ?? [])
      .filter((row: any) => row.user_id !== result.userId)
      .map((row: any) => ({
        user_id: row.user_id,
        full_name: row.users?.full_name ?? "",
        role: row.users?.industry ?? "Mentor",
        city: row.users?.city ?? "",
        match_score: scoreMentor(result.profile as any, {
          ...row,
          users: row.users,
        }),
        industries: row.industries ?? [],
        values_tags: row.values_tags ?? [],
        bio: row.bio ?? "",
      }))
      .sort((a: any, b: any) => b.match_score - a.match_score);

    return ok(matches);
  } catch {
    return serverError();
  }
}
