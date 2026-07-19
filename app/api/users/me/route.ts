import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return NextResponse.json(user ?? null);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();

  const allowed = [
    "name", "full_name", "fullName",
    "bio", "industry", "careerStage", "career_stage",
    "city", "skills", "openToOpportunities", "open_to_opportunities",
    "avatarUrl", "avatar_url", "bannerUrl", "banner_url",
    "showPhoto", "show_photo",
  ];

  const fieldMap: Record<string, string> = {
    name: "full_name",
    full_name: "full_name",
    fullName: "full_name",
    avatar_url: "avatar_url",
    avatarUrl: "avatar_url",
    banner_url: "banner_url",
    bannerUrl: "banner_url",
    career_stage: "career_stage",
    careerStage: "career_stage",
    open_to_opportunities: "open_to_opportunities",
    openToOpportunities: "open_to_opportunities",
    show_photo: "show_photo",
    showPhoto: "show_photo",
  };

  const update: Record<string, unknown> = {};
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) continue;
    const dbKey = fieldMap[key] ?? key;
    update[dbKey] = body[key];
  }
  update.updated_at = new Date().toISOString();

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update(update)
    .eq("id", session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
