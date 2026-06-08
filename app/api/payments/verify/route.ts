import { NextRequest, NextResponse } from "next/server";
import { db } from '@/lib/db';
import { users, subscriptions, eventListings } from '@/lib/db/schema';
import { verifyPaystackTransaction } from "@/lib/api/paystack";
import { notifyAllUsers } from "@/lib/api/notifications";
import { eq, and } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

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
  if (userId && metadata?.payment_type === "event_sponsor" && metadata.event_id) {
    await db.update(eventListings).set({ isActive: true }).where(eq(eventListings.id, metadata.event_id));
    await notifyAllUsers("New sponsored event is live", metadata.event_id);
  } else if (userId) {
    await db.update(users).set({ plan: "pro" }).where(eq(users.id, userId));
    const now = new Date();
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const subscription = {
      userId,
      plan: "pro",
      paystackCustomerCode: result.data.customer?.customer_code,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    };
    const [existing] = await db.select({ id: subscriptions.id }).from(subscriptions).where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"))).limit(1);
    if (existing?.id) {
      await db.update(subscriptions).set(subscription).where(eq(subscriptions.id, existing.id));
    } else {
      await db.insert(subscriptions).values(subscription);
    }
  }
  redirect.searchParams.set("payment", "success");
  return NextResponse.redirect(redirect);
}
