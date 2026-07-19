// Auth.js has been replaced by Supabase Auth.
// This route was previously used by Auth.js handlers.
// Supabase Auth handles sessions via cookies automatically.
// Return 404 if accessed directly.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Auth.js is no longer in use. Use Supabase Auth instead." },
    { status: 404 },
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Auth.js is no longer in use. Use Supabase Auth instead." },
    { status: 404 },
  );
}
