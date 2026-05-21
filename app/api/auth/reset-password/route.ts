import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fail, ok, serverError } from "@/lib/api/response";
import { asRecord, stringValue } from "@/lib/api/parsing";

export async function POST(request: NextRequest) {
  try {
    const email = stringValue(asRecord(await request.json()).email);
    if (!email) return fail("email_required", 400);
    const supabase = createSupabaseServerClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/update-password`,
    });
    return ok({ sent: true });
  } catch {
    return serverError();
  }
}
