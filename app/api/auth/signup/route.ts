import { NextRequest } from "next/server";
import { fail, ok, serverError } from "@/lib/api/response";
import { asRecord, stringValue } from "@/lib/api/parsing";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { initializePaystackTransaction } from "@/lib/api/paystack";

export async function POST(request: NextRequest) {
  try {
    const body = asRecord(await request.json());
    const fullName = stringValue(body.full_name);
    const email = stringValue(body.email);
    const password = stringValue(body.password);
    const industry = stringValue(body.industry);
    const careerStage = stringValue(body.career_stage);
    const city = stringValue(body.city);
    const plan = stringValue(body.plan) === "pro" ? "pro" : "free";
    if (!fullName || !email || !password || !industry || !careerStage || !city) return fail("missing_fields", 400);

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

    const supabase = createSupabaseServiceClient();
    await supabase.from("users").upsert({
      id: data.user.id,
      full_name: fullName,
      email,
      industry,
      career_stage: careerStage,
      city,
      country: "Nigeria",
      plan: plan === "pro" ? "free" : "free",
      skills: [],
      bio: "",
      show_photo: true,
      open_to_opportunities: false,
    });

    if (plan === "pro") {
      const payment = await initializePaystackTransaction({
        email,
        amountKobo: 9_000_00,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/payments/verify`,
        metadata: { user_id: data.user.id, plan: "pro", payment_type: "subscription" },
      });
      return ok({ user_id: data.user.id, authorization_url: payment.data?.authorization_url });
    }

    return ok({ user_id: data.user.id });
  } catch {
    return serverError();
  }
}
