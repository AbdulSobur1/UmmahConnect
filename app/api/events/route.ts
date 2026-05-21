import { requireAuth } from "@/lib/api/auth";
import { eventDto } from "@/lib/api/mappers";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await createSupabaseServerClient().from("event_listings").select("*").eq("is_active", true).gte("event_date", today).order("event_date");
    return ok((data ?? []).map(eventDto));
  } catch {
    return serverError();
  }
}
