import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const supabase = await createClient();
    const { error } = await supabase
      .from("community_members")
      .upsert(
        { community_id: params.id, user_id: auth.userId },
        { onConflict: "community_id, user_id", ignoreDuplicates: true },
      );

    if (error) return fail("join_failed", 400);
    return ok({ joined: true });
  } catch {
    return serverError();
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const supabase = await createClient();
    await supabase
      .from("community_members")
      .delete()
      .eq("community_id", params.id)
      .eq("user_id", auth.userId);

    return ok({ joined: false });
  } catch {
    return serverError();
  }
}
