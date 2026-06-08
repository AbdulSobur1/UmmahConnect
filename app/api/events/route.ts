import { db } from '@/lib/db';
import { eventListings } from '@/lib/db/schema';
import { eventDto } from '@/lib/api/mappers';
import { withHandler, ok, err } from '@/lib/api/helpers';
import { and, eq, gte } from 'drizzle-orm';

export const GET = withHandler(async () => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const data = await db
      .select()
      .from(eventListings)
      .where(and(eq(eventListings.isActive, true), gte(eventListings.eventDate, today)))
      .orderBy(eventListings.eventDate);
    return ok((data ?? []).map(eventDto as any));
  } catch {
    return err('Could not load events', 500);
  }
});
