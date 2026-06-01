import { NextRequest } from "next/server";
import { notifyUser } from "@/lib/api/notifications";
import { verifyPaystackSignature } from "@/lib/api/paystack";
import { fail, ok, serverError } from "@/lib/api/response";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type PaystackWebhook = {
  event: string;
  data?: {
    customer?: { customer_code?: string };
    metadata?: { user_id?: string; plan?: string; event_id?: string; payment_type?: string };
  };
};

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!verifyPaystackSignature(rawBody, request.headers.get("x-paystack-signature"))) return fail("invalid_signature", 401);
    const payload = JSON.parse(rawBody) as PaystackWebhook;
    const supabase = createSupabaseServiceClient();
    const userId = payload.data?.metadata?.user_id;
    if (payload.event === "charge.success" && userId) {
      if (payload.data?.metadata?.payment_type === "event_sponsor" && payload.data.metadata.event_id) {
        await supabase.from("event_listings").update({ is_active: true }).eq("id", payload.data.metadata.event_id);
      } else {
        await supabase.from("users").update({ plan: "pro" }).eq("id", userId);
        const subscription = { user_id: userId, plan: "pro", paystack_customer_code: payload.data?.customer?.customer_code, status: "active" };
        const { data: existing } = await supabase.from("subscriptions").select("id").eq("user_id", userId).eq("status", "active").maybeSingle();
        if (existing?.id) {
          await supabase.from("subscriptions").update(subscription).eq("id", existing.id);
        } else {
          await supabase.from("subscriptions").insert(subscription);
        }
      }
    }
    if (payload.event === "subscription.disable" && userId) {
      await supabase.from("subscriptions").update({ status: "cancelled" }).eq("user_id", userId).eq("status", "active");
      await supabase.from("users").update({ plan: "free" }).eq("id", userId);
    }
    if (payload.event === "invoice.payment_failed" && userId) {
      await supabase.from("subscriptions").update({ status: "at_risk" }).eq("user_id", userId).eq("status", "active");
      await notifyUser({ userId, type: "payment", content: "Your Pro payment failed. Please update your payment method." });
    }
    return ok({ received: true });
  } catch {
    return serverError();
  }
}
