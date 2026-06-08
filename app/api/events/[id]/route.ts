import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { eventListings } from '@/lib/db/schema';
import { withHandler, ok, err } from '@/lib/api/helpers';
import { eventDto } from '@/lib/api/mappers';
import { and, eq, gte } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

export const GET = withHandler(async (_req: NextRequest, ctx?: unknown) => {
  const params = (ctx as { params: { id: string } }).params;
  const today = new Date().toISOString().slice(0, 10);
  const [data] = await db
    .select()
    .from(eventListings)
    .where(and(eq(eventListings.id, params.id), eq(eventListings.isActive, true), gte(eventListings.eventDate, today)))
    .limit(1);

  if (!data) {
    return err('Event not found', 404);
  }

  return ok(eventDto(data as any));
});

