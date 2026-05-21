import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fail, ok, serverError } from "@/lib/api/response";
import { asRecord, stringValue } from "@/lib/api/parsing";

export async function POST(request: NextRequest) {
  try {
    const body = asRecord(await request.json());
    const email = stringValue(body.email);
    const password = stringValue(body.password);
    if (!email || !password) return fail("invalid_credentials", 400);
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return fail("invalid_credentials", 401);
    return ok({ user_id: data.user.id });
  } catch {
    return serverError();
  }
}
