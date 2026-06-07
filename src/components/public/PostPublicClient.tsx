'use client';

import { useState } from 'react';
import { GatedButton } from '@/components/ui/GatedButton';

interface PostPublicClientProps {
  postId: string;
  initialLikes: number;
  user: { id: string } | null;
}

export function PostPublicClient({ postId, initialLikes, user }: PostPublicClientProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function like() {
    const response = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    if (response.ok) setLikes((count) => count + 1);
  }

  async function submitComment() {
    if (!comment.trim()) return;
    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: comment }),
    });
    if (response.ok) {
      setSubmitted(true);
      setComment('');
    }
  }

  return (
    <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
      <GatedButton user={user} onAction={() => void like()} className="btn btn-ghost">
        Like ({likes})
      </GatedButton>
      <div className="row" style={{ flex: 1, minWidth: 240, gap: 8 }}>
        <input
          className="input"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ flex: 1 }}
        />
        <GatedButton user={user} onAction={() => void submitComment()} className="btn btn-primary">
          Comment
        </GatedButton>
      </div>
      {submitted ? <p className="muted">Comment posted.</p> : null}
    </div>
  );
}
