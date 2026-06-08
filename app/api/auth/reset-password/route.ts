import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fail, ok } from "@/lib/api/response";
import { asRecord, stringValue } from "@/lib/api/parsing";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const ipLimit = await checkRateLimit({
      identifier: getClientIp(request),
      action: "auth_reset_password",
      limit: 3,
      windowMs: 60 * 60 * 1000,
    });
    if (ipLimit.limited) return fail(ipLimit.error, 429, { message: ipLimit.message });

    const email = stringValue(asRecord(await request.json()).email)?.toLowerCase();
    const supabase = createSupabaseServerClient();
    if (email) {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/update-password`,
      });
    }
    return ok({ sent: true });
  } catch {
    return ok({ sent: true });
  }
}

