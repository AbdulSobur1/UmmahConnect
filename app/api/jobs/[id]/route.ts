import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { jobs } from '@/lib/db/schema';
import { withHandler, ok, err } from '@/lib/api/helpers';
import { jobDto } from '@/lib/api/mappers';
import { and, eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

export const GET = withHandler(async (_req: NextRequest, ctx?: unknown) => {
  const params = (ctx as { params: { id: string } }).params;
  const [data] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, params.id), eq(jobs.isActive, true), eq(jobs.isHalalVerified, true)))
    .limit(1);

  if (!data) {
    return err('Job not found', 404);
  }

  // Fire-and-forget view count increment
  db.update(jobs).set({ viewsCount: (data.viewsCount ?? 0) + 1 }).where(eq(jobs.id, params.id)).then();

  return ok(jobDto(data as any));
});

