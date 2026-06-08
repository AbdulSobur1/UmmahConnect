import { NextRequest } from 'next/server';
import { signIn } from '@/lib/auth';
import { ok, err } from '@/lib/api/helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return err('Invalid email or password.', 401);
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      return err('Invalid email or password.', 401);
    }

    return ok({ success: true });
  } catch {
    return err('Invalid email or password.', 401);
  }
}

