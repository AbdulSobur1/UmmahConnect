import { NextRequest } from "next/server";
import { notifyUser } from "@/lib/api/notifications";
import { db } from '@/lib/db';
import { users, subscriptions, eventListings } from '@/lib/db/schema';
import { verifyPaystackSignature } from "@/lib/api/paystack";
import { fail, ok, serverError } from "@/lib/api/response";
import { eq, and } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

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
    const userId = payload.data?.metadata?.user_id;
    if (payload.event === "charge.success" && userId) {
      if (payload.data?.metadata?.payment_type === "event_sponsor" && payload.data.metadata.event_id) {
        await db.update(eventListings).set({ isActive: true }).where(eq(eventListings.id, payload.data.metadata.event_id));
      } else {
        await db.update(users).set({ plan: "pro" }).where(eq(users.id, userId));
        const subscription = { userId, plan: "pro", paystackCustomerCode: payload.data?.customer?.customer_code, status: "active" };
        const [existing] = await db.select({ id: subscriptions.id }).from(subscriptions).where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"))).limit(1);
        if (existing?.id) {
          await db.update(subscriptions).set(subscription).where(eq(subscriptions.id, existing.id));
        } else {
          await db.insert(subscriptions).values(subscription);
        }
      }
    }
    if (payload.event === "subscription.disable" && userId) {
      await db.update(subscriptions).set({ status: "cancelled" }).where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")));
      await db.update(users).set({ plan: "free" }).where(eq(users.id, userId));
    }
    if (payload.event === "invoice.payment_failed" && userId) {
      await db.update(subscriptions).set({ status: "at_risk" }).where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")));
      await notifyUser({ userId, type: "payment", content: "Your Pro payment failed. Please update your payment method." });
    }
    return ok({ received: true });
  } catch {
    return serverError();
  }
}

