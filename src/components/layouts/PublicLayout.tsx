import { GuestBanner } from '@/components/ui/GuestBanner';

interface PublicLayoutProps {
  children: React.ReactNode;
  user: { id: string } | null;
}

export function PublicLayout({ children, user }: PublicLayoutProps) {
  return (
    <div style={{ paddingBottom: user ? 0 : 72 }}>
      {children}
      {!user && <GuestBanner />}
    </div>
  );
}
