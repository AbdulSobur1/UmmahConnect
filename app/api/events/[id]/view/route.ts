import { ok } from "@/lib/api/response";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase.from("event_listings").select("views_count").eq("id", params.id).single();
  await supabase.from("event_listings").update({ views_count: (data?.views_count ?? 0) + 1 }).eq("id", params.id);
  return ok({ tracked: true });
}
