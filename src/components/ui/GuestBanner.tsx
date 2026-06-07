'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function GuestBanner() {
  const pathname = usePathname();
  const next = encodeURIComponent(pathname);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 50,
      background: '#1A6B5C',
      borderTop: '1px solid rgba(255,255,255,0.12)',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <p style={{
        color: 'rgba(255,255,255,0.85)',
        fontSize: 14,
        fontWeight: 400,
        margin: 0,
      }}>
        You&apos;re viewing UmmahConnect as a guest.{' '}
        <span style={{ color: '#fff', fontWeight: 600 }}>
          Join free to connect, apply, and belong.
        </span>
      </p>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <Link
          href={`/signup?next=${next}`}
          style={{
            background: '#C9A84C',
            color: '#0D1B1E',
            padding: '9px 20px',
            borderRadius: 100,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Join Free
        </Link>
        <Link
          href={`/login?next=${next}`}
          style={{
            background: 'rgba(255,255,255,0.12)',
            color: '#fff',
            padding: '9px 20px',
            borderRadius: 100,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
