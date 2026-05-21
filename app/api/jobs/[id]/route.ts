import { requireAuth } from "@/lib/api/auth";
import { jobDto } from "@/lib/api/mappers";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("jobs").select("*").eq("id", params.id).eq("is_active", true).single();
    if (!data) return fail("not_found", 404);
    return ok(jobDto(data));
  } catch {
    return serverError();
  }
}
