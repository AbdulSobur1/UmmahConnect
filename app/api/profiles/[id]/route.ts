import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { withHandler, ok, err } from '@/lib/api/helpers';
import { publicProfileDto } from '@/lib/api/mappers';
import { eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

export const GET = withHandler(async (_req: NextRequest, ctx?: unknown) => {
  const params = (ctx as { params: { id: string } }).params;
  const [data] = await db
    .select()
    .from(users)
    .where(eq(users.id, params.id))
    .limit(1);

  if (!data || data.isBanned) {
    return err('Profile not found', 404);
  }

  return ok(publicProfileDto(data as any));
});

