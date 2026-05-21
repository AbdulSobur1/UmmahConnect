import { requireAuth } from "@/lib/api/auth";
import { communityDto } from "@/lib/api/mappers";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const supabase = createSupabaseServerClient();
    let query = supabase.from("communities").select("*").order("member_count", { ascending: false });
    if (auth.profile.plan === "free") query = query.eq("is_private", false);
    const { data } = await query;
    return ok((data ?? []).map(communityDto));
  } catch {
    return serverError();
  }
}
