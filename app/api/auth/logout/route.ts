import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Supabase's signOut already clears cookies; this response is just a confirmation
  return NextResponse.json({
    data: { success: true },
    error: null,
    status: 200,
  });
}
