import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth";
import { communityDto } from "@/lib/api/mappers";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const supabase = await createClient();
    const { data: allCommunities } = await supabase
      .from("communities")
      .select("*")
      .order("member_count", { ascending: false });

    const filtered =
      auth.plan === "free"
        ? (allCommunities ?? []).filter((c: any) => !c.is_private)
        : allCommunities ?? [];

    return ok(filtered.map(communityDto as any));
  } catch {
    return serverError();
  }
}
