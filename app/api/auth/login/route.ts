import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ok, err } from "@/lib/api/helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return err("Invalid email or password.", 401);
    }

    // Clerk handles sign-in through its own API
    // This endpoint is kept for backward compatibility but login is done via Clerk UI
    return ok({ success: true });
  } catch {
    return err("Invalid email or password.", 401);
  }
}
