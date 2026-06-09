"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Filter, Plus, Search, Bookmark, Home, ShieldCheck, ArrowRight } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { HalalBadge } from "@/components/HalalBadge";
import { Modal } from "@/components/Modal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { apiGet, apiSend } from "@/lib/api/client";
import { formatPostTime } from "@/lib/utils/time";
import type { Job, User } from "@/lib/mock";

const filters = ["All", "Remote", "Finance", "Tech", "Creative"];

export function Jobs() {
  const [showPostJob, setShowPostJob] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
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
  const normalizedSearch = search.trim().toLowerCase();
  const filteredJobs = useMemo(() => {
    return (jobs.data ?? []).filter((job) => {
      const matchesSearch = !normalizedSearch || [job.title, job.company, job.location, job.industry, job.career_stage].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
      const matchesFilter =
        activeFilter === "All" ||
        job.job_type === activeFilter ||
        job.industry === activeFilter ||
        job.career_stage === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, jobs.data, normalizedSearch]);

  function openPostJob() {
    if (me.data?.plan !== "pro") setShowUpgrade(true);
    else setShowPostJob(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    postJob.mutate({ ...Object.fromEntries(new FormData(event.currentTarget).entries()), halal_confirmed: true });
  }

  function toggleSave(jobId: string) {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  }

  if (jobs.isLoading) return <div className="skeleton" />;
  if (jobs.error) return <ErrorState retry={() => void jobs.refetch()} />;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, fontFamily: "var(--font-display), serif" }}>Jobs</h1>
          <p className="muted" style={{ fontSize: 13, margin: "4px 0 0" }}>
            Halal-verified opportunities from values-led companies
          </p>
        </div>
        {me.data?.plan === "pro" && (
          <button className="btn btn-primary" onClick={openPostJob} style={{ minHeight: 36, fontSize: 13, padding: "0 14px" }}>
            <Briefcase size={14} /> Post job
          </button>
        )}
      </div>

      {/* Search + filter bar */}
      <div className="card" style={{ padding: 12, position: "sticky", top: 72, zIndex: 10, background: "var(--color-bg-dark)", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--color-bg-secondary)", borderRadius: 12, padding: "0 12px", height: 40 }}>
          <Search size={16} color="var(--color-muted-light)" />
          <input
            className="input"
            placeholder="Search jobs, companies..."
            style={{ border: 0, padding: 0, background: "transparent", height: "100%" }}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
          <Filter size={16} color="var(--color-primary)" />
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10, overflowX: "auto", paddingBottom: 4 }}>
          {filters.map((filter) => (
            <button
              className={activeFilter === filter ? "btn btn-primary" : "btn-ghost"}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{ fontSize: 12, padding: "4px 12px", minHeight: 32, whiteSpace: "nowrap" }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Job cards */}
      <div className="grid" style={{ gap: 10 }}>
        {filteredJobs.map((job) => {
          const isSaved = savedJobs.has(job.id);
          return (
            <article
              key={job.id}
              className="card"
              style={{ padding: 14, cursor: "pointer" }}
              onClick={() => setSelectedJob(job)}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                {/* Company logo/initials */}
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "rgba(94,205,181,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "var(--color-success)",
                  flexShrink: 0,
                }}>
                  {job.company.charAt(0)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <strong style={{ fontSize: 16 }}>{job.title}</strong>
                      <p className="muted" style={{ fontSize: 13, margin: "2px 0 0" }}>
                        {job.company} · {job.location} · {job.job_type}
                      </p>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--color-muted-light)", whiteSpace: "nowrap" }}>
                      {formatPostTime(job.created_at)}
                    </span>
                  </div>

                  {/* Tags */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    {job.is_halal_verified && (
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 8px",
                        borderRadius: "100px",
                        fontSize: 11,
                        fontWeight: 700,
                        background: "rgba(94,205,181,0.12)",
                        color: "var(--color-success)",
                      }}>
                        <ShieldCheck size={11} /> HALAL VERIFIED
                      </span>
                    )}
                    {job.is_remote && (
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 8px",
                        borderRadius: "100px",
                        fontSize: 11,
                        fontWeight: 700,
                        background: "rgba(255,255,255,0.06)",
                        color: "var(--color-muted-light)",
                      }}>
                        <Home size={11} /> Remote
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                    <button
                      className="btn-ghost"
                      style={{ fontSize: 12, padding: "4px 8px", minHeight: 32, display: "flex", alignItems: "center", gap: 4 }}
                      onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}
                    >
                      <Bookmark size={14} fill={isSaved ? "var(--color-primary)" : "none"} />
                      {isSaved ? "Saved" : "Save"}
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: 12, padding: "4px 14px", minHeight: 32, marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}
                      onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}
                    >
                      Apply Now <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div className="card" style={{ padding: 20, textAlign: "center", marginTop: 10 }}>
          <strong style={{ fontSize: 15 }}>No matching roles</strong>
          <p className="muted" style={{ fontSize: 13, margin: "4px 0 0" }}>Try another search term or filter.</p>
        </div>
      )}

      {/* Floating post button for Pro users */}
      {me.data?.plan === "pro" && (
        <button
          onClick={openPostJob}
          style={{
            position: "fixed",
            bottom: 88,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: 0,
            background: "var(--color-primary)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(26,107,92,0.4)",
            zIndex: 30,
            transition: "transform 160ms ease",
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <Plus size={24} />
        </button>
      )}

      {/* Post Job Modal */}
      {showPostJob ? (
        <Modal title="Post a halal-verified job" onClose={() => setShowPostJob(false)}>
          <form className="grid" onSubmit={submit}>
            <input className="input" name="title" placeholder="Job title" required />
            <input className="input" name="company" placeholder="Company" required />
            <input className="input" name="location" placeholder="Location" />
            <input className="input" name="industry" placeholder="Industry" />
            <select className="input" name="job_type" defaultValue="Remote">
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-site</option>
              <option>Full-time</option>
            </select>
            <label className="row" style={{ fontSize: 13 }}>
              <input type="checkbox" defaultChecked /> I confirm this role meets halal compliance expectations.
            </label>
            <button className="btn btn-primary" disabled={postJob.isPending}>Submit job</button>
          </form>
        </Modal>
      ) : null}

      {/* Job Detail Modal */}
      {selectedJob ? (
        <Modal title={selectedJob.title} onClose={() => setSelectedJob(null)}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(94,205,181,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 16,
              color: "var(--color-success)",
            }}>
              {selectedJob.company.charAt(0)}
            </div>
            <div>
              <strong style={{ fontSize: 16 }}>{selectedJob.company}</strong>
              <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                {selectedJob.location}
              </p>
            </div>
          </div>
          <p className="muted" style={{ fontSize: 14 }}>
            {selectedJob.industry} · {selectedJob.career_stage} · {selectedJob.salary_range}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <span className="pill" style={{ fontSize: 12, padding: "4px 10px" }}>{selectedJob.job_type}</span>
            {selectedJob.is_halal_verified && <HalalBadge />}
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={() => setSelectedJob(null)}>
            Apply for this role
          </button>
        </Modal>
      ) : null}

      {showUpgrade ? <UpgradeModal onClose={() => setShowUpgrade(false)} /> : null}
    </div>
  );
}

function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 18 }}>Jobs did not load</h2>
      <button className="btn btn-primary" onClick={retry} style={{ marginTop: 12 }}>Retry</button>
    </div>
  );
}
