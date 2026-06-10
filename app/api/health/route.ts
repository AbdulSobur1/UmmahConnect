import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, string> = {};

  // Check 1: Environment variables
  checks['DATABASE_URL'] = process.env.DATABASE_URL ? 'set' : 'MISSING';
  checks['AUTH_SECRET'] = process.env.AUTH_SECRET ? 'set' : 'MISSING';
  checks['NEXTAUTH_URL'] = process.env.NEXTAUTH_URL ?? 'MISSING';


  // Check 2: Database connectivity
  try {
    const { db } = await import('@/lib/db');
    const { users } = await import('@/lib/db/schema');
    const { count } = await import('drizzle-orm');
    const [result] = await db.select({ count: count() }).from(users);
    checks['database'] = `connected (${result?.count ?? 0} users)`;
  } catch (e) {
    checks['database'] = `FAILED: ${e instanceof Error ? e.message : 'unknown error'}`;
  }

  // Check 3: Auth
  try {
    const { auth } = await import('@/lib/auth');
    const session = await auth();
    checks['auth'] = session?.user ? `authenticated as ${session.user.id}` : 'no session';
  } catch (e) {
    checks['auth'] = `FAILED: ${e instanceof Error ? e.message : 'unknown error'}`;
  }

  const allOk = Object.values(checks).every((v) => !v.startsWith('FAILED') && !v.includes('MISSING'));

  return NextResponse.json({
    status: allOk ? 'healthy' : 'degraded',
    checks,
  });
}
