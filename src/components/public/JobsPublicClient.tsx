'use client';

import { useMemo, useState } from 'react';
import { HalalBadge } from '@/components/HalalBadge';
import { GatedButton } from '@/components/ui/GatedButton';

type PublicJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  is_remote: boolean;
  job_type: string;
  industry: string;
  is_halal_verified: boolean;
  career_stage: string;
  salary_range: string;
  created_at: string;
};

const filters = ['All', 'Remote', 'Finance', 'Tech', 'Creative'] as const;

interface JobsPublicClientProps {
  jobs: PublicJob[];
  user: { id: string } | null;
}

export function JobsPublicClient({ jobs, user }: JobsPublicClientProps) {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All');
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Remote') return job.is_remote;
      if (activeFilter === 'Finance') return job.industry.toLowerCase().includes('finance');
      if (activeFilter === 'Tech') return job.industry.toLowerCase().includes('tech');
      if (activeFilter === 'Creative') return job.industry.toLowerCase().includes('creative');
      return true;
    });
  }, [activeFilter, jobs]);

  function apply(jobId: string) {
    setAppliedId(jobId);
  }

  return (
    <div>
      <div className="row" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {filters.map((filter) => (
          <button
            key={filter}
            className={`btn ${activeFilter === filter ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="grid two-col">
        {filteredJobs.map((job) => (
          <article className="card" style={{ padding: 20 }} key={job.id}>
            <div className="row space-between">
              <span className="pill">{job.industry}</span>
              {job.is_halal_verified ? <HalalBadge /> : null}
            </div>
            <h2 className="font-display" style={{ fontSize: 28, margin: '12px 0 8px' }}>{job.title}</h2>
            <p><strong>{job.company}</strong> · {job.location}</p>
            <p className="muted">
              {job.is_remote ? 'Remote' : job.job_type} · {job.career_stage}
              {job.salary_range ? ` · ${job.salary_range}` : ''}
            </p>
            <GatedButton
              user={user}
              onAction={() => apply(job.id)}
              className="btn btn-primary"
              style={{ marginTop: 12 }}
            >
              {appliedId === job.id ? 'Interest Recorded' : 'Apply'}
            </GatedButton>
          </article>
        ))}
      </div>
      {filteredJobs.length === 0 ? (
        <div className="card" style={{ padding: 20 }}>
          <strong>No matching roles</strong>
          <p className="muted">Try another filter.</p>
        </div>
      ) : null}
    </div>
  );
}
