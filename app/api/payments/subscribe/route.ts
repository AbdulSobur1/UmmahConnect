import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { initializePaystackTransaction } from "@/lib/api/paystack";
import { asRecord, stringValue } from "@/lib/api/parsing";
import { fail, ok, serverError } from "@/lib/api/response";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return fail(auth.error, 401);
    const body = asRecord(await request.json());
    const plan = stringValue(body.plan);
    const eventId = stringValue(body.event_id);
    const isSponsor = plan === "sponsor";
    if (plan !== "pro" && plan !== "sponsor") return fail("invalid_plan", 400);
    const payment = await initializePaystackTransaction({
      email: auth.email,
      amountKobo: isSponsor ? 49_000_00 : 9_000_00,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/payments/verify`,
      metadata: { user_id: auth.userId, plan, payment_type: isSponsor ? "event_sponsor" : "subscription", event_id: eventId ?? "" },
    });
    if (!payment.status || !payment.data?.authorization_url) return fail("payment_initialization_failed", 400);
    return ok({ authorization_url: payment.data.authorization_url, reference: payment.data.reference });
  } catch {
    return serverError();
  }
}
