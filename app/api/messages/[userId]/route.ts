import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { mondayWeekStart } from "@/lib/api/business";
import { messageDto } from "@/lib/api/mappers";
import { notifyUser } from "@/lib/api/notifications";
import { asRecord, stringValue } from "@/lib/api/parsing";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: { userId: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${auth.userId},receiver_id.eq.${params.userId}),and(sender_id.eq.${params.userId},receiver_id.eq.${auth.userId})`)
      .order("created_at");
    return ok((data ?? []).map(messageDto));
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const content = stringValue(asRecord(await request.json()).content);
    if (!content) return fail("content_required", 400);
    const supabase = createSupabaseServerClient();
    const weekStart = mondayWeekStart();
    const { data: current } = await supabase.from("message_weekly_counts").select("*").eq("user_id", auth.userId).eq("week_start", weekStart).maybeSingle();
    const count = current?.count ?? 0;
    if (auth.profile.plan === "free" && count >= 10) return fail("weekly_limit_reached", 403);
    const { data: message } = await supabase.from("messages").insert({ sender_id: auth.userId, receiver_id: params.userId, content }).select("*").single();
    if (!message) return fail("send_failed", 400);
    await supabase.from("message_weekly_counts").upsert({ user_id: auth.userId, week_start: weekStart, count: count + 1 });
    await notifyUser({ userId: params.userId, type: "message", content: `New message from ${auth.profile.full_name}`, referenceId: message.id });
    return ok({ message: messageDto(message), weekly_count: count + 1 }, 201);
  } catch {
    return serverError();
  }
}
