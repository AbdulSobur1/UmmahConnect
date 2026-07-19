import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/validation";
import { withHandler, parseBody, ok } from "@/lib/api/helpers";
import bcrypt from "bcryptjs";

export const POST = withHandler(async (req: NextRequest) => {
  const body = await parseBody(req, signupSchema);

  const supabase = await createClient();

  // Check if email already exists
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", body.email)
    .maybeSingle();

  if (existing) {
    throw { status: 409, message: "An account with this email already exists." };
  }

  // Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      data: {
        full_name: body.full_name,
        industry: body.industry,
        career_stage: body.career_stage,
        city: body.city,
        country: body.country,
      },
    },
  });

  if (authError || !authData.user) {
    throw { status: 400, message: authError?.message ?? "Signup failed" };
  }

  const industry =
    body.industry === "Other" && body.industry_custom
      ? body.industry_custom
      : body.industry;

  const hashedPassword = await bcrypt.hash(body.password, 12);

  // Create user in public.users table
  const { error: dbError } = await supabase.from("users").insert({
    id: authData.user.id,
    full_name: body.full_name,
    email: body.email,
    password: hashedPassword,
    industry,
    career_stage: body.career_stage,
    city: body.city,
    country: "Nigeria",
    plan: body.plan,
  });

  if (dbError) {
    throw { status: 400, message: dbError.message };
  }

  return ok({ id: authData.user.id, email: authData.user.email }, 201);
});
