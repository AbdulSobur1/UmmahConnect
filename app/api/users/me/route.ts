import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  return NextResponse.json(user[0] ?? null);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const body = await req.json();

  // Only allow specific fields to be updated
  const allowed = [
    "name", "full_name", "bio", "industry", "careerStage", "career_stage",
    "city", "skills", "openToOpportunities", "open_to_opportunities",
    "avatarUrl", "avatar_url", "bannerUrl", "banner_url", "showPhoto", "show_photo",
  ];

  // Map snake_case API fields to camelCase Drizzle schema fields
  const fieldMap: Record<string, string> = {
    name: "fullName",
    full_name: "fullName",
    avatar_url: "avatarUrl",
    banner_url: "bannerUrl",
    career_stage: "careerStage",
    open_to_opportunities: "openToOpportunities",
    show_photo: "showPhoto",
  };

  const update: Record<string, unknown> = {};
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) continue;
    const dbKey = fieldMap[key] ?? key;
    update[dbKey] = body[key];
  }
  update.updatedAt = new Date();
  await db.update(users).set(update).where(eq(users.id, session.user.id));
  return NextResponse.json({ success: true });
}
