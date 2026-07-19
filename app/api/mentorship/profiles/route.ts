import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireAuthWithProfile } from "@/lib/api/auth";
import { fail, ok, serverError } from "@/lib/api/response";
import { asRecord, stringArrayValue, stringValue } from "@/lib/api/parsing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const supabase = await createClient();
    const { data } = await supabase
      .from("mentorship_profiles")
      .select("*, users:user_id(*)");

    return ok((data ?? []).map((row: any) => ({
      user_id: row.user_id,
      full_name: row.users?.full_name ?? "",
      role: row.users?.industry ?? row.role ?? "Mentor",
      city: row.users?.city ?? "",
      match_score: 0,
      industries: row.industries ?? [],
      values_tags: row.values_tags ?? [],
      bio: row.bio ?? "",
    })));
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await requireAuthWithProfile();
    if ("error" in result) return fail("unauthorized", 401);

    const body = asRecord(await request.json());
    const requestedRole = stringValue(body.role);
    const role =
      requestedRole === "mentor" || requestedRole === "both" || requestedRole === "mentee"
        ? requestedRole
        : "mentee";

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mentorship_profiles")
      .upsert(
        {
          user_id: result.userId,
          role,
          industries: stringArrayValue(body.industries) ?? [],
          languages: stringArrayValue(body.languages) ?? ["English"],
          values_tags: stringArrayValue(body.values_tags) ?? [],
          career_stage:
            stringValue(body.career_stage) ?? (result.profile.career_stage ?? null),
          bio: stringValue(body.bio) ?? "",
          years_experience: Number(body.years_experience ?? 0),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (error) return fail("create_failed", 400);
    return ok(data);
  } catch {
    return serverError();
  }
}
