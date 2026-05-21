import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRow } from "@/lib/supabase/types";

export type AuthContext = {
  userId: string;
  email: string;
  profile: UserRow;
};

export async function requireAuth(): Promise<AuthContext | { error: "unauthorized" }> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id || !user.email) {
    return { error: "unauthorized" };
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
  if (!profile) {
    return { error: "unauthorized" };
  }

  return { userId: user.id, email: user.email, profile };
}
