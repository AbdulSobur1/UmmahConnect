import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth";
import { postDto } from "@/lib/api/mappers";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("*, users:user_id(*)")
      .eq("community_id", params.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    return ok((data ?? []).map((row: any) => postDto({ ...row, users: row.users })));
  } catch {
    return serverError();
  }
}
