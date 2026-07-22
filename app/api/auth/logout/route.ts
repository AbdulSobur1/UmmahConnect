import { NextResponse } from "next/server";

export async function POST() {
  // Clerk handles sign-out through its own API
  // This endpoint is kept for backward compatibility
  return NextResponse.json({
    data: { success: true },
    error: null,
    status: 200,
  });
}
