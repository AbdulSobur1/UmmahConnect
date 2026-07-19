import { createClient } from "@/lib/supabase/server";
import { ok } from "@/lib/api/helpers";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("event_listings")
    .select("clicks_count")
    .eq("id", params.id)
    .single();

  await supabase
    .from("event_listings")
    .update({ clicks_count: (existing?.clicks_count ?? 0) + 1 })
    .eq("id", params.id);

  return ok({ tracked: true });
}
