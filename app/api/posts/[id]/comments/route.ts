import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { comments, posts, users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api/auth';
import { fail, ok, serverError } from '@/lib/api/response';
import { eq, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const data = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, params.id))
      .orderBy(comments.createdAt);
    return ok(data ?? []);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const body = await request.json();
    const content = body?.content;
    if (!content) return fail('content_required', 400);
    const [comment] = await db.insert(comments).values({ postId: params.id, userId: auth.userId, content }).returning();
    const commentCount = await db.select({ count: comments.postId }).from(comments).where(eq(comments.postId, params.id));
    await db.update(posts).set({ commentsCount: commentCount.length }).where(eq(posts.id, params.id));
    return ok(comment, 201);
  } catch {
    return serverError();
  }
}

