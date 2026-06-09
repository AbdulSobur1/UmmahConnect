"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, UserPlus, Globe } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { HalalBadge } from "@/components/HalalBadge";
import { apiGet, apiSend } from "@/lib/api/client";
import type { Community, EventListing, Job, User } from "@/lib/mock";

export function Discover() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const communities = useQuery({ queryKey: ["communities"], queryFn: () => apiGet<Community[]>("/api/communities") });
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const users = useQuery({ queryKey: ["suggested-users"], queryFn: () => apiGet<User[]>("/api/users/suggestions") });
  const jobs = useQuery({ queryKey: ["jobs"], queryFn: () => apiGet<Job[]>("/api/jobs") });
  const events = useQuery({ queryKey: ["events"], queryFn: () => apiGet<EventListing[]>("/api/events") });
  const connect = useMutation({
    mutationFn: (receiver_id: string) => apiSend("/api/connections", "POST", { receiver_id }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(new Set());

  const normalizedSearch = search.trim().toLowerCase();
  const filteredCommunities = useMemo(() => {
    const list = communities.data ?? [];
    if (!normalizedSearch) return list;
    return list.filter((community) =>
      [community.name, community.description].some((value) => value.toLowerCase().includes(normalizedSearch)),
    );
  }, [communities.data, normalizedSearch]);

  const suggestedUsers = useMemo(() => {
    return (users.data ?? []).filter(
      (user) => user.id !== me.data?.id && user.industry && user.industry !== "Other" && user.industry !== ""
    );
  }, [me.data?.id, users.data]);

  const halalJobs = (jobs.data ?? []).slice(0, 3);
  const upcomingEvents = (events.data ?? []).slice(0, 2);

  if (communities.isLoading) return <div className="skeleton" />;
  if (communities.error) return <ErrorState retry={() => void communities.refetch()} />;

  function toggleJoin(communityId: string) {
    setJoinedCommunities((prev) => {
      const next = new Set(prev);
      if (next.has(communityId)) next.delete(communityId);
      else next.add(communityId);
      return next;
    });
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* Section 1 - Search */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--color-bg-secondary)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "0 14px",
        height: 44,
      }}>
        <Search size={18} color="var(--color-muted-light)" />
        <input
          className="input"
          placeholder="Search people, communities, jobs..."
          style={{ border: 0, padding: 0, background: "transparent", height: "100%" }}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
      </div>

      {/* Section 2 - People you may know */}
      <section>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>People you may know</h2>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}>
          {suggestedUsers.slice(0, 8).map((user) => (
            <div
              key={user.id}
              className="card"
              style={{
                padding: 14,
                minWidth: 140,
                flexShrink: 0,
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <Avatar name={user.full_name} size={48} />
              </div>
              <strong style={{ fontSize: 14, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.full_name}
              </strong>
              <p className="muted" style={{ fontSize: 12, margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.industry}
              </p>
              <p className="muted" style={{ fontSize: 11, margin: "2px 0 8px" }}>
                {user.city}
              </p>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: "4px 10px", minHeight: 32, width: "100%" }}
                disabled={connect.isPending}
                onClick={() => connect.mutate(user.id)}
              >
                <UserPlus size={14} /> Connect
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3 - Communities for you */}
      <section>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>Communities for you</h2>
        {connect.error ? (
          <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>Connection request could not be sent.</p>
        ) : null}
        <div className="grid" style={{ gap: 8 }}>
          {(search ? filteredCommunities : communities.data ?? []).slice(0, 6).map((community) => {
            const isJoined = joinedCommunities.has(community.id);
            return (
              <div
                key={community.id}
                className="card"
                style={{
                  padding: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(94,205,181,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "var(--color-success)",
                  flexShrink: 0,
                }}>
                  {community.icon || community.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 15 }}>{community.name}</strong>
                  {community.description && (
                    <p className="muted" style={{ fontSize: 13, margin: "2px 0 0", lineHeight: 1.3 }}>
                      {community.description}
                    </p>
                  )}
                  <p style={{ fontSize: 13, color: "var(--color-muted-light)", margin: "2px 0 0" }}>
                    {community.member_count.toLocaleString()} members
                  </p>
                </div>
                <button
                  className={isJoined ? "btn btn-primary" : "btn-ghost"}
                  style={{ fontSize: 12, padding: "4px 12px", minHeight: 32, flexShrink: 0 }}
                  onClick={() => toggleJoin(community.id)}
                >
                  {isJoined ? "Joined" : "Join"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4 - Halal Job Picks */}
      {halalJobs.length > 0 && (
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>Halal Job Picks</h2>
          <div className="grid" style={{ gap: 8 }}>
            {halalJobs.map((job) => (
              <div key={job.id} className="card" style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <strong style={{ fontSize: 15 }}>{job.title}</strong>
                  <HalalBadge />
                </div>
                <p className="muted" style={{ fontSize: 13, margin: "4px 0 0" }}>
                  {job.company} · {job.location} {job.is_remote ? "· Remote" : ""}
                </p>
                <button className="btn-link" style={{ fontSize: 13, marginTop: 6, color: "var(--color-primary)" }}>
                  View &amp; Apply →
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 5 - Upcoming Islamic Events */}
      {upcomingEvents.length > 0 && (
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>Upcoming Islamic Events</h2>
          <div className="grid" style={{ gap: 8 }}>
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="sponsored-card"
                style={{ padding: 14 }}
              >
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: "var(--color-accent)",
                }}>
                  ★ Sponsored
                </span>
                <h3 style={{ margin: "6px 0 2px", fontSize: 15, fontWeight: 700 }}>{event.title}</h3>
                <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                  {event.event_date} · {event.location_detail} · {event.location_type}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {search && filteredCommunities.length === 0 && suggestedUsers.filter(u =>
        [u.full_name, u.industry, u.city].some(v => v.toLowerCase().includes(normalizedSearch))
      ).length === 0 && (
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          <Globe size={32} color="var(--color-muted-light)" style={{ marginBottom: 8 }} />
          <strong>No results found</strong>
          <p className="muted" style={{ fontSize: 13, margin: "4px 0 0" }}>Try a different search term.</p>
        </div>
      )}
    </div>
  );
}

function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 18 }}>Discover did not load</h2>
      <button className="btn btn-primary" onClick={retry} style={{ marginTop: 12 }}>Retry</button>
    </div>
  );
}
