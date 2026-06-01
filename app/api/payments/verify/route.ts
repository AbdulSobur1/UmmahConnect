import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackTransaction } from "@/lib/api/paystack";
import { notifyAllUsers } from "@/lib/api/notifications";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  const redirect = new URL("/feed", process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin);
  if (!reference) {
    redirect.searchParams.set("payment", "missing_reference");
    return NextResponse.redirect(redirect);
  }
  const result = await verifyPaystackTransaction(reference);
  if (!result.status || result.data?.status !== "success") {
    redirect.searchParams.set("payment", "failed");
    return NextResponse.redirect(redirect);
  }
  const metadata = result.data.metadata;
  const userId = metadata?.user_id;
  const supabase = createSupabaseServiceClient();
  if (userId && metadata?.payment_type === "event_sponsor" && metadata.event_id) {
    await supabase.from("event_listings").update({ is_active: true }).eq("id", metadata.event_id);
    await notifyAllUsers("New sponsored event is live", metadata.event_id);
  } else if (userId) {
    await supabase.from("users").update({ plan: "pro" }).eq("id", userId);
    const subscription = {
      user_id: userId,
      plan: "pro",
      paystack_customer_code: result.data.customer?.customer_code,
      status: "active",
      current_period_start: result.data.paid_at ?? new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const { data: existing } = await supabase.from("subscriptions").select("id").eq("user_id", userId).eq("status", "active").maybeSingle();
    if (existing?.id) {
      await supabase.from("subscriptions").update(subscription).eq("id", existing.id);
    } else {
      await supabase.from("subscriptions").insert(subscription);
    }
  }
  redirect.searchParams.set("payment", "success");
  return NextResponse.redirect(redirect);
}
