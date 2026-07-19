import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth";
import { mondayWeekStart } from "@/lib/api/business";
import { messageDto } from "@/lib/api/mappers";
import { notifyUser } from "@/lib/api/notifications";
import { fail, ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { userId: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const supabase = await createClient();
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${auth.userId},receiver_id.eq.${params.userId}),and(sender_id.eq.${params.userId},receiver_id.eq.${auth.userId})`,
      )
      .order("created_at", { ascending: true });

    return ok((data ?? []).map(messageDto as any));
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);

    const body = await request.json();
    const content = body?.content;
    if (!content) return fail("content_required", 400);

    const weekStart = mondayWeekStart();
    const supabase = await createClient();

    // Check weekly limit
    const { data: current } = await supabase
      .from("message_weekly_counts")
      .select("*")
      .eq("user_id", auth.userId)
      .eq("week_start", weekStart)
      .maybeSingle();

    const count = (current as { count?: number })?.count ?? 0;
    if (auth.plan === "free" && count >= 10) return fail("weekly_limit_reached", 403);

    const { data: message, error } = await supabase
      .from("messages")
      .insert({ sender_id: auth.userId, receiver_id: params.userId, content })
      .select()
      .single();

    if (error || !message) return fail("send_failed", 400);

    // Upsert weekly count
    await supabase.from("message_weekly_counts").upsert(
      { user_id: auth.userId, week_start: weekStart, count: count + 1 },
      { onConflict: "user_id, week_start" },
    );

    const { data: sender } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", auth.userId)
      .single();

    await notifyUser({
      userId: params.userId,
      type: "message",
      content: `New message from ${sender?.full_name ?? "Someone"}`,
      referenceId: message.id,
    });

    return ok(
      { message: messageDto(message as any), weekly_count: count + 1 },
      201,
    );
  } catch {
    return serverError();
  }
}
