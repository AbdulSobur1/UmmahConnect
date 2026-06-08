import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ZodSchema } from 'zod';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null, status }, { status });
}

export function err(message: string, status: number, details?: unknown) {
  return NextResponse.json(
    { data: null, error: message, details: details ?? null, status },
    { status }
  );
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw { status: 401, message: 'Authentication required' };
  }
  return { userId: session.user.id, plan: (session.user as { plan?: string }).plan ?? 'free' };
}

export async function parseBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw { status: 400, message: 'Invalid JSON body' };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    throw { status: 400, message: 'Validation failed', details: result.error.flatten() };
  }
  return result.data;
}

export function withHandler(
  handler: (req: NextRequest, ctx?: unknown) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx?: unknown) => {
    try {
      return await handler(req, ctx);
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'status' in e) {
        const typed = e as { status: number; message: string; details?: unknown };
        return err(typed.message, typed.status, typed.details ?? null);
      }
      console.error('[API Error]', e);
      return err('Internal server error', 500);
    }
  };
}
