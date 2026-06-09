'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatPostTime } from '@/lib/utils/time';
import { GatedButton } from '@/components/ui/GatedButton';

type CommunityPost = {
  id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user: { id: string; full_name: string } | null;
};

interface CommunityPublicClientProps {
  communityId: string;
  posts: CommunityPost[];
  user: { id: string } | null;
}

export function CommunityPublicClient({ communityId, posts, user }: CommunityPublicClientProps) {
  const [joined, setJoined] = useState(false);

  async function join() {
    const response = await fetch(`/api/communities/${communityId}/join`, { method: 'POST' });
    if (response.ok) setJoined(true);
  }

  async function like(postId: string) {
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
  }

  return (
    <div>
      <GatedButton user={user} onAction={() => void join()} className="btn btn-primary">
        {joined ? 'Joined' : 'Join Community'}
      </GatedButton>
      <div className="grid" style={{ marginTop: 24, gap: 16 }}>
        {posts.map((post) => (
          <article className="card" style={{ padding: 20 }} key={post.id}>
            <div className="row space-between">
              {post.user ? (
                <Link href={`/profiles/${post.user.id}`} style={{ fontWeight: 600 }}>
                  {post.user.full_name}
                </Link>
              ) : (
                <span>Member</span>
              )}
              <small className="muted">{formatPostTime(post.created_at)}</small>
            </div>
            <p style={{ margin: '12px 0' }}>{post.content}</p>
            <div className="row" style={{ gap: 8 }}>
              <GatedButton user={user} onAction={() => void like(post.id)} className="btn btn-ghost">
                Like ({post.likes_count})
              </GatedButton>
              <GatedButton
                user={user}
                onAction={() => {}}
                className="btn btn-ghost"
              >
                Comment ({post.comments_count})
              </GatedButton>
            </div>
          </article>
        ))}
        {posts.length === 0 ? <p className="muted">No posts yet in this community.</p> : null}
      </div>
    </div>
  );
}
