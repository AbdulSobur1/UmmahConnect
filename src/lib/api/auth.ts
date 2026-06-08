import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export type AuthContext = {
  userId: string;
  email: string;
  plan: string;
};

export async function requireAuth(): Promise<AuthContext | { error: 'unauthorized' }> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { error: 'unauthorized' };
  }
  return {
    userId: session.user.id,
    email: session.user.email,
    plan: (session.user as { plan?: string }).plan ?? 'free',
  };
}

export async function requireAuthWithProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'unauthorized' as const };
  }
  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  if (!profile) {
    return { error: 'unauthorized' as const };
  }
  return { userId: session.user.id, email: session.user.email, profile, plan: profile.plan };
}
