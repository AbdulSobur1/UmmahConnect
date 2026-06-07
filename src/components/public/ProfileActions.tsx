'use client';

import { useState } from 'react';
import { GatedButton } from '@/components/ui/GatedButton';

interface ProfileActionsProps {
  user: { id: string } | null;
  profileId: string;
}

export function ProfileActions({ user, profileId }: ProfileActionsProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  async function connect() {
    setStatus('loading');
    const response = await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver_id: profileId }),
    });
    if (response.ok) {
      setStatus('sent');
    } else {
      setStatus('error');
    }
  }

  return (
    <div>
      <GatedButton
        user={user}
        onAction={() => void connect()}
        className="btn btn-primary"
        style={{ marginTop: 16 }}
      >
        {status === 'loading' ? 'Connecting...' : status === 'sent' ? 'Request Sent' : 'Connect'}
      </GatedButton>
      {status === 'error' ? (
        <p className="muted" style={{ marginTop: 8 }}>Could not send connection request. Please try again.</p>
      ) : null}
    </div>
  );
}
