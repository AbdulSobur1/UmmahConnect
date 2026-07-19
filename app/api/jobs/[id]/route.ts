import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withHandler, ok, err } from "@/lib/api/helpers";
import { jobDto } from "@/lib/api/mappers";

export const dynamic = "force-dynamic";

export const GET = withHandler(async (_req: NextRequest, ctx?: unknown) => {
  const params = (ctx as { params: { id: string } }).params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", params.id)
    .eq("is_active", true)
    .eq("is_halal_verified", true)
    .single();

  if (!data) {
    return err("Job not found", 404);
  }

  // Fire-and-forget view count increment
  supabase
    .from("jobs")
    .update({ views_count: (data.views_count ?? 0) + 1 })
    .eq("id", params.id)
    .then();

  return ok(jobDto(data as any));
});
