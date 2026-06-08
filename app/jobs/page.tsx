import Link from 'next/link';
import { Metadata } from 'next';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { JobsPublicClient } from '@/components/public/JobsPublicClient';
import { jobDto } from '@/lib/api/mappers';
import { getSessionUser } from '@/lib/auth/session';
import { getDemoJobs, isDemoMode } from '@/lib/demo/server';
import { db } from '@/lib/db';
import { jobs } from '@/lib/db/schema';
import { and, eq, desc } from 'drizzle-orm';

export const metadata: Metadata = {
  title: 'Halal Jobs in Nigeria — Ummah Connect',
  description: 'Browse halal-verified career opportunities for Muslim professionals in Nigeria.',
  openGraph: {
    title: 'Halal Jobs in Nigeria — Ummah Connect',
    description: 'Browse halal-verified career opportunities for Muslim professionals in Nigeria.',
  },
};

async function fetchJobs() {
  if (isDemoMode()) return getDemoJobs();
  const data = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.isActive, true), eq(jobs.isHalalVerified, true)))
    .orderBy(desc(jobs.createdAt));
  return (data ?? []).map((j: any) => jobDto(j));
}

export default async function PublicJobsPage() {
  const [jobList, user] = await Promise.all([fetchJobs(), getSessionUser()]);

  return (
    <PublicLayout user={user}>
      <main className="page">
        <div className="container">
          <Link href="/" className="brand public-brand">
            Ummah <span>Connect</span>
          </Link>
          <div className="screen-title">
            <div>
              <h1 className="font-display">Halal Jobs</h1>
              <p className="muted">Verified opportunities for Muslim professionals in Nigeria.</p>
            </div>
          </div>
          <JobsPublicClient jobs={jobList} user={user} />
        </div>
      </main>
    </PublicLayout>
  );
}
