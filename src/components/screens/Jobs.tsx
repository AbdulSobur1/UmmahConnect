"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Plus, Search, Bookmark, ShieldCheck, ArrowRight, Home } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { HalalBadge } from "@/components/HalalBadge";
import { Modal } from "@/components/Modal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { ErrorState, IconBox, Tag } from "@/components/ui/Common";
import { PageTransition } from "@/components/ui/PageTransition";
import { apiGet, apiSend } from "@/lib/api/client";
import { formatPostTime } from "@/lib/utils/time";
import type { Job, User } from "@/types";

const filters = ["All", "Remote", "Finance", "Tech", "Creative", "Healthcare"];

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
      const matchesSearch = !normalizedSearch ||
        [job.title, job.company, job.location, job.industry, job.career_stage].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        );
      const matchesFilter =
        activeFilter === "All" ||
        job.job_type === activeFilter ||
        job.industry === activeFilter ||
        job.career_stage === activeFilter ||
        (activeFilter === "Remote" && job.is_remote);
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
  if (jobs.error) return <ErrorState onRetry={() => void jobs.refetch()} title="Jobs did not load" />;

  return (
    <PageTransition>
      {/* Sticky header */}
      <div
        style={{
          padding: 12,
          position: "sticky",
          top: 72,
          zIndex: 10,
          background: "#0D1B1E",
          marginBottom: 14,
        }}
      >
        {/* Search bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#132420",
            borderRadius: 12,
            padding: "0 12px",
            height: 44,
          }}
        >
          <Search size={16} color="rgba(255,255,255,0.55)" />
          <input
            className="input"
            placeholder="Search jobs, companies..."
            style={{ border: 0, padding: 0, background: "transparent", height: "100%" }}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
        </div>
        {/* Filter pills */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 10,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                fontSize: 12,
                padding: "4px 12px",
                minHeight: 32,
                whiteSpace: "nowrap",
                borderRadius: 100,
                border: activeFilter === filter ? "none" : "1px solid rgba(255,255,255,0.08)",
                background: activeFilter === filter ? "#1A6B5C" : "transparent",
                color: activeFilter === filter ? "#fff" : "rgba(255,255,255,0.55)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Job cards */}
      <div style={{ display: "grid", gap: 10 }}>
        {filteredJobs.map((job) => {
          const isSaved = savedJobs.has(job.id);
          return (
            <article
              key={job.id}
              style={{
                background: "#132420",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: 16,
                cursor: "pointer",
              }}
              onClick={() => setSelectedJob(job)}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                {/* Company logo/initials */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "rgba(94,205,181,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#5ECDB5",
                    flexShrink: 0,
                  }}
                >
                  {job.company.charAt(0)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <strong style={{ fontSize: 16 }}>{job.title}</strong>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "2px 0 0" }}>
                        {job.company} · {job.location} · {job.job_type}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.55)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatPostTime(job.created_at)}
                    </span>
                  </div>

                  {/* Tags */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    {job.is_halal_verified && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "3px 8px",
                          borderRadius: 100,
                          fontSize: 11,
                          fontWeight: 700,
                          background: "rgba(94,205,181,0.1)",
                          color: "#5ECDB5",
                          border: "1px solid rgba(94,205,181,0.16)",
                        }}
                      >
                        <ShieldCheck size={11} /> HALAL VERIFIED
                      </span>
                    )}
                    {job.is_remote && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "3px 8px",
                          borderRadius: 100,
                          fontSize: 11,
                          fontWeight: 700,
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.55)",
                        }}
                      >
                        <Home size={11} /> Remote
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 10,
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      paddingTop: 10,
                    }}
                  >
                    <button
                      style={{
                        fontSize: 12,
                        padding: "4px 8px",
                        minHeight: 32,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        borderRadius: 100,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "transparent",
                        color: "rgba(255,255,255,0.55)",
                        cursor: "pointer",
                      }}
                      onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}
                    >
                      <Bookmark size={14} fill={isSaved ? "#1A6B5C" : "none"} />
                      {isSaved ? "Saved" : "Save"}
                    </button>
                    <button
                      style={{
                        fontSize: 12,
                        padding: "4px 14px",
                        minHeight: 32,
                        marginLeft: "auto",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        borderRadius: 100,
                        border: "none",
                        background: "#1A6B5C",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
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
        <div
          style={{
            background: "#132420",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: 20,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          <strong style={{ fontSize: 15 }}>No matching roles</strong>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "4px 0 0" }}>
            Try another search term or filter.
          </p>
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
            background: "#1A6B5C",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(26,107,92,0.4)",
            zIndex: 30,
          }}
        >
          <Plus size={24} />
        </button>
      )}

      {/* Post Job Modal */}
      {showPostJob ? (
        <Modal title="Post a halal-verified job" onClose={() => setShowPostJob(false)}>
          <form
            onSubmit={submit}
            style={{ display: "grid", gap: 16 }}
          >
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
            <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" defaultChecked /> I confirm this role meets halal compliance expectations.
            </label>
            <button
              className="btn btn-primary"
              disabled={postJob.isPending}
              style={{ borderRadius: 100, minHeight: 44 }}
            >
              Submit job
            </button>
          </form>
        </Modal>
      ) : null}

      {/* Job Detail Modal */}
      {selectedJob ? (
        <Modal title={selectedJob.title} onClose={() => setSelectedJob(null)}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <IconBox>{selectedJob.company.charAt(0)}</IconBox>
            <div>
              <strong style={{ fontSize: 16 }}>{selectedJob.company}</strong>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0 }}>
                {selectedJob.location}
              </p>
            </div>
          </div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
            {selectedJob.industry} · {selectedJob.career_stage} · {selectedJob.salary_range}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 999,
                padding: "8px 12px",
                color: "#5ECDB5",
                background: "rgba(94,205,181,0.1)",
                border: "1px solid rgba(94,205,181,0.16)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {selectedJob.job_type}
            </span>
            {selectedJob.is_halal_verified && <HalalBadge />}
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 16, width: "100%", borderRadius: 100 }}
            onClick={() => setSelectedJob(null)}
          >
            Apply for this role
          </button>
        </Modal>
      ) : null}

      {showUpgrade ? <UpgradeModal onClose={() => setShowUpgrade(false)} /> : null}
    </PageTransition>
  );
}
