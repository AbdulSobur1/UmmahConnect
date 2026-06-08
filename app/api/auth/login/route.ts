import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fail, ok, serverError } from "@/lib/api/response";
import { asRecord, stringValue } from "@/lib/api/parsing";
import { checkRateLimit, clearFailedLogin, getClientIp, isCooldownActive, recordFailedLogin } from "@/lib/api/rate-limit";
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = asRecord(await request.json());
    const email = stringValue(body.email)?.toLowerCase();
    const password = stringValue(body.password);
    const ipLimit = await checkRateLimit({
      identifier: getClientIp(request),
      action: "auth_login",
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (ipLimit.limited) return fail(ipLimit.error, 429, { message: ipLimit.message });
    if (!email || !password) return fail("Invalid email or password.", 401);
    if (await isCooldownActive(email, `login_attempt_${email}`)) {
      return fail("too_many_requests", 429, { message: "Too many attempts. Try again later." });
    }
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      const emailLimit = await recordFailedLogin(email);
      if (emailLimit.limited) return fail(emailLimit.error, 429, { message: emailLimit.message });
      return fail("Invalid email or password.", 401);
    }
    await clearFailedLogin(email);
    return ok({ user_id: data.user.id });
  } catch {
    return serverError();
  }
}

