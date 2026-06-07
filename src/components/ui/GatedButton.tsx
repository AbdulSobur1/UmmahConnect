'use client';

import { useRouter, usePathname } from 'next/navigation';

interface GatedButtonProps {
  user: { id: string } | null;
  onAction: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function GatedButton({
  user,
  onAction,
  children,
  style,
  className,
}: GatedButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleClick() {
    if (!user) {
      router.push(`/signup?next=${encodeURIComponent(pathname)}`);
      return;
    }
    onAction();
  }

  return (
    <button onClick={handleClick} style={style} className={className}>
      {children}
    </button>
  );
}
