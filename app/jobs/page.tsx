import { Metadata } from 'next';
import { AppShell } from '@/components/AppShell';
import { Jobs } from '@/components/screens/Jobs';

export const metadata: Metadata = {
  title: 'Halal Jobs in Nigeria — Ummah Connect',
  description: 'Browse halal-verified career opportunities for Muslim professionals in Nigeria.',
  openGraph: {
    title: 'Halal Jobs in Nigeria — Ummah Connect',
    description: 'Browse halal-verified career opportunities for Muslim professionals in Nigeria.',
  },
};

export default function JobsPage() {
  return (
    <AppShell>
      <Jobs />
    </AppShell>
  );
}
