import { db } from '@/lib/db';
import { postLikes, posts } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api/auth';
import { fail, ok, serverError } from '@/lib/api/response';
import { and, eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic'

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return fail(auth.error, 401);
    const [existing] = await db.select().from(postLikes).where(and(eq(postLikes.postId, params.id), eq(postLikes.userId, auth.userId))).limit(1);
    if (existing) {
      await db.delete(postLikes).where(and(eq(postLikes.postId, params.id), eq(postLikes.userId, auth.userId)));
      const likes = await db.select({ count: postLikes.postId }).from(postLikes).where(eq(postLikes.postId, params.id));
      const count = likes.length;
      await db.update(posts).set({ likesCount: count }).where(eq(posts.id, params.id));
      return ok({ liked: false, likes_count: count });
    }
    await db.insert(postLikes).values({ postId: params.id, userId: auth.userId });
    const likes = await db.select({ count: postLikes.postId }).from(postLikes).where(eq(postLikes.postId, params.id));
    const count = likes.length;
    await db.update(posts).set({ likesCount: count }).where(eq(posts.id, params.id));
    return ok({ liked: true, likes_count: count });
  } catch {
    return serverError();
  }
}

