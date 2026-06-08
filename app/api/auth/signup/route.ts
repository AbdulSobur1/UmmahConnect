import { NextRequest } from "next/server";
import { fail, ok, serverError } from "@/lib/api/response";
import { asRecord } from "@/lib/api/parsing";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";
import { signupSchema } from "@/lib/validation";
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const ipLimit = await checkRateLimit({
      identifier: getClientIp(request),
      action: "auth_signup",
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (ipLimit.limited) return fail(ipLimit.error, 429, { message: ipLimit.message });

    const body = asRecord(await request.json());
    const parsed = signupSchema.safeParse({ ...body, country: "Nigeria" });
    if (!parsed.success) return fail("validation_failed", 400);
    const { full_name: fullName, email, password, industry, career_stage: careerStage, city } = parsed.data;

    const authClient = createSupabaseServerClient();
    const { data, error } = await authClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/login`,
        data: { full_name: fullName },
      },
    });
    if (error || !data.user) return fail("signup_failed", 400);
    await authClient.auth.signOut();

    const supabase = createSupabaseServiceClient();
    await supabase.from("users").upsert({
      id: data.user.id,
      full_name: fullName,
      email,
      industry,
      career_stage: careerStage,
      city,
      country: "Nigeria",
      // Pro signups start as free until Paystack verifies the first payment.
      plan: "free",
      skills: [],
      bio: "",
      show_photo: true,
      open_to_opportunities: false,
    });

    return ok({ user_id: data.user.id, email });
  } catch {
    return serverError();
  }
}

