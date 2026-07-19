import { auth } from "@/lib/auth";

export async function getSessionUser(): Promise<{ id: string; plan?: string } | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return { id: session.user.id, plan: session.user.plan };
}
