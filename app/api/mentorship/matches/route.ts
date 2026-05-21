import { requireAuth } from "@/lib/api/auth";
import { scoreMentor } from "@/lib/api/business";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MentorshipProfileRow, UserRow } from "@/lib/supabase/types";

type JoinedMentor = MentorshipProfileRow & { users?: UserRow | null };

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    if (auth.profile.plan !== "pro") return fail("pro_required", 403, { feature: "mentorship_matches" });
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("mentorship_profiles").select("*, users(*)").in("role", ["mentor", "both"]);
    const matches = ((data ?? []) as unknown as JoinedMentor[])
      .filter((mentor) => mentor.user_id !== auth.userId)
      .map((mentor) => ({
        user_id: mentor.user_id,
        full_name: mentor.users?.full_name ?? "",
        role: mentor.users?.industry ?? "Mentor",
        city: mentor.users?.city ?? "",
        match_score: scoreMentor(auth.profile, mentor),
        industries: mentor.industries ?? [],
        values_tags: mentor.values_tags ?? [],
        bio: mentor.bio ?? "",
      }))
      .sort((a, b) => b.match_score - a.match_score);
    return ok(matches);
  } catch {
    return serverError();
  }
}
