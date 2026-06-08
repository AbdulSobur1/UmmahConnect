import { NextRequest } from 'next/server';
import { ok } from '@/lib/api/helpers';

export async function POST(_request: NextRequest) {
  // Password reset via email will be wired in a future session.
  return ok({ sent: true });
}

