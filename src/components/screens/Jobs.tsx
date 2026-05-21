"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Filter, Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { HalalBadge } from "@/components/HalalBadge";
import { Modal } from "@/components/Modal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { apiGet, apiSend } from "@/lib/api/client";
import type { Job, User } from "@/lib/mock";

export function Jobs() {
  const [showPostJob, setShowPostJob] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const jobs = useQuery({ queryKey: ["jobs"], queryFn: () => apiGet<Job[]>("/api/jobs") });
  const postJob = useMutation({
    mutationFn: (body: Record<string, FormDataEntryValue | boolean>) => apiSend<Job>("/api/jobs", "POST", body),
    onSuccess: () => {
      setShowPostJob(false);
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: () => setShowUpgrade(true),
  });

  function openPostJob() {
    if (me.data?.plan !== "pro") setShowUpgrade(true);
    else setShowPostJob(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    postJob.mutate({ ...Object.fromEntries(new FormData(event.currentTarget).entries()), halal_confirmed: true });
  }

  if (jobs.isLoading) return <div className="skeleton" />;
  if (jobs.error) return <ErrorState retry={() => void jobs.refetch()} />;

  return (
    <div>
      <div className="screen-title"><div><h1>Jobs</h1><p className="muted">Halal-verified opportunities from companies hiring values-led professionals.</p></div><button className="btn btn-primary" onClick={openPostJob}><Briefcase size={17} /> Post job</button></div>
      <div className="card" style={{ padding: 14, marginBottom: 18 }}>
        <div className="row"><Search color="#6B7E78" /><input className="input" placeholder="Search roles, companies, or cities" style={{ border: 0 }} /><Filter color="#1A6B5C" /></div>
        <div className="row" style={{ flexWrap: "wrap", marginTop: 12 }}>{["All", "Remote", "Hybrid", "Tech", "Creative", "Finance", "Early Career"].map((filter) => <span className="pill" key={filter}>{filter}</span>)}</div>
      </div>
      <div className="grid two-col">
        {(jobs.data ?? []).map((job) => (
          <article className="card" style={{ padding: 20 }} key={job.id}>
            <div className="row space-between"><span className="pill">{job.job_type}</span>{job.is_halal_verified ? <HalalBadge /> : null}</div>
            <h2 className="font-display" style={{ fontSize: 32 }}>{job.title}</h2>
            <p><strong>{job.company}</strong> · {job.location}</p>
            <p className="muted">{job.industry} · {job.career_stage} · {job.salary_range}</p>
            <div className="row space-between"><small className="muted">Posted {job.created_at.slice(0, 10)}</small><button className="btn btn-ghost">View role</button></div>
          </article>
        ))}
      </div>
      {showPostJob ? (
        <Modal title="Post a halal-verified job" onClose={() => setShowPostJob(false)}>
          <form className="grid" onSubmit={submit}>
            <input className="input" name="title" placeholder="Job title" required />
            <input className="input" name="company" placeholder="Company" required />
            <input className="input" name="location" placeholder="Location" />
            <input className="input" name="industry" placeholder="Industry" />
            <select className="input" name="job_type" defaultValue="Remote"><option>Remote</option><option>Hybrid</option><option>On-site</option><option>Full-time</option></select>
            <label className="row"><input type="checkbox" defaultChecked /> I confirm this role meets halal compliance expectations.</label>
            <button className="btn btn-primary" disabled={postJob.isPending}>Submit job</button>
          </form>
        </Modal>
      ) : null}
      {showUpgrade ? <UpgradeModal onClose={() => setShowUpgrade(false)} /> : null}
    </div>
  );
}

function ErrorState({ retry }: { retry: () => void }) {
  return <div className="card" style={{ padding: 24 }}><h2>Jobs did not load</h2><button className="btn btn-primary" onClick={retry}>Retry</button></div>;
}
