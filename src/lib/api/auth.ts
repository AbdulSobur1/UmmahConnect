import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type AuthContext = {
  userId: string;
  email: string;
  plan: string;
};

export async function requireAuth(): Promise<AuthContext | { error: "unauthorized" }> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { error: "unauthorized" };
  }
  return {
    userId: session.user.id,
    email: session.user.email,
    plan: session.user.plan ?? "free",
  };
}

export async function requireAuthWithProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "unauthorized" as const };
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!profile) {
    return { error: "unauthorized" as const };
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    profile,
    plan: profile.plan,
  };
}
