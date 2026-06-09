'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function GuestBanner() {
  const pathname = usePathname();
  const next = encodeURIComponent(pathname);

  return (
    <div className="guest-banner">
      <p>
        You&apos;re viewing Ummah Connect as a guest. <strong>Join to connect, apply, and belong.</strong>
      </p>
      <div className="guest-banner__actions">
        <Link href={`/signup?next=${next}`} className="btn btn-accent">
          Join
        </Link>
        <Link href={`/login?next=${next}`} className="btn btn-ghost">
          Log In
        </Link>
      </div>
    </div>
  );
}
