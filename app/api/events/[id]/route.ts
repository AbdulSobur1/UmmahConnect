import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withHandler, ok, err } from "@/lib/api/helpers";
import { eventDto } from "@/lib/api/mappers";

export const dynamic = "force-dynamic";

export const GET = withHandler(async (_req: NextRequest, ctx?: unknown) => {
  const params = (ctx as { params: { id: string } }).params;
  const today = new Date().toISOString().slice(0, 10);

  const supabase = await createClient();
  const { data } = await supabase
    .from("event_listings")
    .select("*")
    .eq("id", params.id)
    .eq("is_active", true)
    .gte("event_date", today)
    .single();

  if (!data) {
    return err("Event not found", 404);
  }

  return ok(eventDto(data as any));
});
