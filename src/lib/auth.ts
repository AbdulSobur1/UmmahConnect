import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

export async function auth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  // Fetch plan from the users table
  const { data: profile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single();
  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "",
      plan: (profile as { plan?: string })?.plan ?? "free",
    },
  };
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { data };
}

export async function signUp(input: {
  email: string;
  password: string;
  fullName: string;
  industry: string;
  careerStage: string;
  city: string;
  country: string;
}) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        industry: input.industry,
        career_stage: input.careerStage,
        city: input.city,
        country: input.country,
      },
    },
  });
  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Signup failed" };

  // Hash password for legacy compatibility (supabase already hashes it, but we store it too)
  const hashedPassword = await bcrypt.hash(input.password, 12);

  // Create user record in the public.users table
  const { error: dbError } = await supabase.from("users").insert({
    id: authData.user.id,
    full_name: input.fullName,
    email: input.email,
    password: hashedPassword,
    industry: input.industry,
    career_stage: input.careerStage,
    city: input.city,
    country: input.country,
    plan: "free",
  });

  if (dbError) return { error: dbError.message };
  return { data: authData };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}
