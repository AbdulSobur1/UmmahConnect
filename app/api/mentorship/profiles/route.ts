import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { asRecord, stringArrayValue, stringValue } from "@/lib/api/parsing";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MentorshipProfileRow, UserRow } from "@/lib/supabase/types";
export const dynamic = 'force-dynamic'

type JoinedMentor = MentorshipProfileRow & { users?: UserRow | null };

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("mentorship_profiles").select("*, users(*)");
    return ok(((data ?? []) as unknown as JoinedMentor[]).map((profile) => ({
      user_id: profile.user_id,
      full_name: profile.users?.full_name ?? "",
      role: profile.users?.industry ?? profile.role ?? "Mentor",
      city: profile.users?.city ?? "",
      match_score: 0,
      industries: profile.industries ?? [],
      values_tags: profile.values_tags ?? [],
      bio: profile.bio ?? "",
    })));
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const body = asRecord(await request.json());
    const requestedRole = stringValue(body.role);
    const role = requestedRole === "mentor" || requestedRole === "both" || requestedRole === "mentee" ? requestedRole : "mentee";
    const { data } = await createSupabaseServerClient().from("mentorship_profiles").upsert({
      user_id: auth.userId,
      role,
      industries: stringArrayValue(body.industries) ?? [],
      languages: stringArrayValue(body.languages) ?? ["English"],
      values_tags: stringArrayValue(body.values_tags) ?? [],
      career_stage: stringValue(body.career_stage) ?? auth.profile.career_stage,
      bio: stringValue(body.bio) ?? "",
      years_experience: Number(body.years_experience ?? 0),
    }).select("*").single();
    return ok(data);
  } catch {
    return serverError();
  }
}

