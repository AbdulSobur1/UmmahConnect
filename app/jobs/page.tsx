import Link from 'next/link';
import { Metadata } from 'next';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { JobsPublicClient } from '@/components/public/JobsPublicClient';
import { jobDto } from '@/lib/api/mappers';
import { getSessionUser } from '@/lib/auth/session';
import { getDemoJobs, isDemoMode } from '@/lib/demo/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Halal Jobs in Nigeria — UmmahConnect',
  description: 'Browse halal-verified career opportunities for Muslim professionals in Nigeria.',
  openGraph: {
    title: 'Halal Jobs in Nigeria — UmmahConnect',
    description: 'Browse halal-verified career opportunities for Muslim professionals in Nigeria.',
  },
};

async function fetchJobs() {
  if (isDemoMode()) return getDemoJobs();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .eq('is_halal_verified', true)
    .order('created_at', { ascending: false });
  return (data ?? []).map(jobDto);
}

export default async function PublicJobsPage() {
  const [jobs, user] = await Promise.all([fetchJobs(), getSessionUser()]);

  return (
    <PublicLayout user={user}>
      <main className="page" style={{ padding: '32px 0' }}>
        <div className="container">
          <Link href="/" className="brand" style={{ display: 'inline-block', marginBottom: 24 }}>
            UmmahConnect
          </Link>
          <div className="screen-title" style={{ marginBottom: 24 }}>
            <div>
              <h1 className="font-display" style={{ fontSize: 42, margin: 0 }}>Halal Jobs</h1>
              <p className="muted">Verified opportunities for Muslim professionals in Nigeria.</p>
            </div>
          </div>
          <JobsPublicClient jobs={jobs} user={user} />
        </div>
      </main>
    </PublicLayout>
  );
}
