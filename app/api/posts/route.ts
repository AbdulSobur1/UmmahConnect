import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { posts, users } from '@/lib/db/schema';
import { requireAuth, requireAuthWithProfile } from '@/lib/api/auth';
import { postDto } from '@/lib/api/mappers';
import { fail, ok, serverError } from '@/lib/api/response';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail('unauthorized', 401);
    const data = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.isDeleted, false))
      .orderBy(desc(posts.createdAt));
    return ok((data ?? []).map((row: any) => postDto({ ...row.posts, users: row.users })));
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await requireAuthWithProfile();
    if ('error' in result) return fail('unauthorized', 401);
    const body = await request.json();
    const content = typeof body?.content === 'string' && body.content.trim().length > 0
      ? body.content.trim()
      : undefined;
    if (!content) return fail('content_required', 400);
    const [data] = await db
      .insert(posts)
      .values({
        userId: result.userId,
        content,
        communityId: typeof body.community_id === 'string' ? body.community_id : null,
      })
      .returning();
    if (!data) return fail('create_failed', 400);
    const fullPost = { ...data, users: result.profile };
    return ok(postDto(fullPost as any), 201);
  } catch {
    return serverError();
  }
}
