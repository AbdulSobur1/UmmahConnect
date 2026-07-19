import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check 1: Environment variables
  checks["NEXT_PUBLIC_SUPABASE_URL"] = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? "set"
    : "MISSING";
  checks["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? "set"
    : "MISSING";

  // Check 2: Database connectivity
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    checks["database"] = error
      ? `FAILED: ${error.message}`
      : `connected (${count ?? 0} users)`;
  } catch (e) {
    checks["database"] = `FAILED: ${e instanceof Error ? e.message : "unknown error"}`;
  }

  // Check 3: Auth
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    checks["auth"] = user ? `authenticated as ${user.id}` : "no session";
  } catch (e) {
    checks["auth"] = `FAILED: ${e instanceof Error ? e.message : "unknown error"}`;
  }

  const allOk = Object.values(checks).every(
    (v) => !v.startsWith("FAILED") && !v.includes("MISSING"),
  );

  return NextResponse.json({
    status: allOk ? "healthy" : "degraded",
    checks,
  });
}
