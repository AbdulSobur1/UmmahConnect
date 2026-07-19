import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withHandler, ok, err } from "@/lib/api/helpers";
import { publicProfileDto } from "@/lib/api/mappers";

export const dynamic = "force-dynamic";

export const GET = withHandler(async (_req: NextRequest, ctx?: unknown) => {
  const params = (ctx as { params: { id: string } }).params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!data || data.is_banned) {
    return err("Profile not found", 404);
  }

  return ok(publicProfileDto(data as any));
});
