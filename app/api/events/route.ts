import { createClient } from "@/lib/supabase/server";
import { eventDto } from "@/lib/api/mappers";
import { withHandler, ok, err } from "@/lib/api/helpers";

export const GET = withHandler(async () => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("event_listings")
      .select("*")
      .eq("is_active", true)
      .gte("event_date", today)
      .order("event_date", { ascending: true });

    return ok((data ?? []).map(eventDto as any));
  } catch {
    return err("Could not load events", 500);
  }
});
