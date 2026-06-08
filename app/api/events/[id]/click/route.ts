import { db } from '@/lib/db';
import { eventListings } from '@/lib/db/schema';
import { ok } from '@/lib/api/helpers';
import { eq } from 'drizzle-orm';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const [existing] = await db.select({ clicksCount: eventListings.clicksCount }).from(eventListings).where(eq(eventListings.id, params.id)).limit(1);
  await db.update(eventListings).set({ clicksCount: (existing?.clicksCount ?? 0) + 1 }).where(eq(eventListings.id, params.id));
  return ok({ tracked: true });
}

