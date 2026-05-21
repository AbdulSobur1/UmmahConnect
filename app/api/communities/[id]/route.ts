import { requireAuth } from "@/lib/api/auth";
import { communityDto } from "@/lib/api/mappers";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("communities").select("*").eq("id", params.id).single();
    if (!data) return fail("not_found", 404);
    if (data.is_private && auth.profile.plan === "free") return fail("pro_required", 403, { feature: "private_communities" });
    return ok(communityDto(data));
  } catch {
    return serverError();
  }
}
