import crypto from "crypto";

type PaystackInitializeResponse = {
  status: boolean;
  data?: {
    authorization_url: string;
    reference: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  data?: {
    status: string;
    reference: string;
    customer?: { customer_code?: string; email?: string };
    metadata?: { user_id?: string; plan?: string; event_id?: string; payment_type?: string };
    paid_at?: string;
  };
};

export async function initializePaystackTransaction(input: {
  email: string;
  amountKobo: number;
  currency?: string;
  callbackUrl: string;
  metadata: Record<string, string>;
}) {
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      currency: input.currency ?? "NGN",
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });

  return response.json() as Promise<PaystackInitializeResponse>;
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY ?? ""}`,
    },
  });

  return response.json() as Promise<PaystackVerifyResponse>;
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY ?? "").update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}
