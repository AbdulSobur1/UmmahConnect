import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withHandler, ok, err } from "@/lib/api/helpers";
import { communityDto, postDto } from "@/lib/api/mappers";

export const dynamic = "force-dynamic";

export const GET = withHandler(async (_req: NextRequest, ctx?: unknown) => {
  const params = (ctx as { params: { id: string } }).params;
  const supabase = await createClient();

  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!community) {
    return err("Community not found", 404);
  }

  if (community.is_private) {
    return ok({
      ...communityDto(community as any),
      is_private: true,
    });
  }

  const { data: postRows } = await supabase
    .from("posts")
    .select("*, users:user_id(*)")
    .eq("community_id", params.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return ok({
    ...communityDto(community as any),
    posts: (postRows ?? []).map((row: any) =>
      postDto({ ...row, users: row.users }),
    ),
  });
});
