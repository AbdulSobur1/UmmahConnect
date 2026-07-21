"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Globe } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { ErrorState } from "@/components/ui/Common";
import { PageTransition } from "@/components/ui/PageTransition";
import { apiGet, apiSend } from "@/lib/api/client";
import type { Community, EventListing, Job, User } from "@/types";

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
  if (communities.error) return <ErrorState onRetry={() => void communities.refetch()} title="Discover did not load" />;

  function toggleJoin(communityId: string) {
    setJoinedCommunities((prev) => {
      const next = new Set(prev);
      if (next.has(communityId)) next.delete(communityId);
      else next.add(communityId);
      return next;
    });
  }

  return (
    <PageTransition>
      <div style={{ display: "grid", gap: 24 }}>
      {/* SECTION 1 — Search bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#132420",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "0 14px",
          height: 44,
        }}
      >
        <span style={{ fontSize: 16 }}>🔍</span>
        <input
          className="input"
          placeholder="Search professionals, communities, topics..."
          style={{ border: 0, padding: 0, background: "transparent", height: "100%" }}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
      </div>

      {/* SECTION 2 — People you may know */}
      <section>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px", fontFamily: "'DM Sans', sans-serif" }}>
          People you may know
        </h2>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}>
          {suggestedUsers.slice(0, 8).map((user) => (
            <div
              key={user.id}
              style={{
                background: "#132420",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: 16,
                minWidth: 140,
                flexShrink: 0,
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <Avatar name={user.full_name} size={52} />
              </div>
              <strong
                style={{
                  fontSize: 14,
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.full_name}
              </strong>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.55)",
                  margin: "2px 0 0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.industry}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", margin: "2px 0 8px" }}>{user.city}</p>
              <button
                style={{
                  fontSize: 12,
                  padding: "4px 10px",
                  minHeight: 32,
                  width: "100%",
                  border: "1px solid #1A6B5C",
                  borderRadius: 100,
                  background: "transparent",
                  color: "#1A6B5C",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  cursor: "pointer",
                }}
                disabled={connect.isPending}
                onClick={() => connect.mutate(user.id)}
              >
                <UserPlus size={14} /> Connect
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — Communities for you */}
      <section>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px", fontFamily: "'DM Sans', sans-serif" }}>
          Communities for you
        </h2>
        {connect.error ? (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>
            Connection request could not be sent.
          </p>
        ) : null}
        <div style={{ display: "grid", gap: 8 }}>
          {(search ? filteredCommunities : communities.data ?? []).slice(0, 6).map((community) => {
            const isJoined = joinedCommunities.has(community.id);
            return (
              <div
                key={community.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Avatar name={community.name} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 15 }}>{community.name}</strong>
                  {community.description && (
                    <p
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.55)",
                        margin: "2px 0 0",
                        lineHeight: 1.3,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {community.description}
                    </p>
                  )}
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "2px 0 0" }}>
                    {community.member_count.toLocaleString()} members
                  </p>
                </div>
                <button
                  style={{
                    fontSize: 12,
                    padding: "4px 12px",
                    minHeight: 32,
                    flexShrink: 0,
                    borderRadius: 100,
                    border: isJoined ? "none" : "1px solid #1A6B5C",
                    background: isJoined ? "#1A6B5C" : "transparent",
                    color: isJoined ? "#fff" : "#1A6B5C",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  onClick={() => toggleJoin(community.id)}
                >
                  {isJoined ? "Joined" : "Join"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4 — Halal Job Picks */}
      {halalJobs.length > 0 && (
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px", fontFamily: "'DM Sans', sans-serif" }}>
            Halal Job Picks
          </h2>
          <div style={{ display: "grid", gap: 8 }}>
            {halalJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  background: "#132420",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <strong style={{ fontSize: 15 }}>{job.title}</strong>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#5ECDB5",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    ✓ HALAL
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "4px 0 0" }}>
                  {job.company} · {job.location}
                  {job.is_remote ? " · Remote" : ""}
                </p>
                <button
                  style={{
                    fontSize: 13,
                    marginTop: 6,
                    color: "#1A6B5C",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    padding: 0,
                  }}
                >
                  View &amp; Apply →
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 5 — Upcoming Islamic Events */}
      {upcomingEvents.length > 0 && (
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px", fontFamily: "'DM Sans', sans-serif" }}>
            Upcoming Islamic Events
          </h2>
          <div style={{ display: "grid", gap: 8 }}>
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  border: "1px solid #C9A84C",
                  background: "rgba(201,168,76,0.06)",
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#C9A84C",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  ★ Sponsored
                </span>
                <h3 style={{ margin: "6px 0 2px", fontSize: 15, fontWeight: 700 }}>{event.title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0 }}>
                  {event.event_date} · {event.location_detail}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {search &&
        filteredCommunities.length === 0 &&
        suggestedUsers.filter((u) =>
          [u.full_name, u.industry, u.city].some((v) => v.toLowerCase().includes(normalizedSearch)),
        ).length === 0 && (
          <div
            style={{
              background: "#132420",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              padding: 24,
              textAlign: "center",
            }}
          >
            <Globe size={32} color="rgba(255,255,255,0.55)" style={{ marginBottom: 8 }} />
            <strong>No results found</strong>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "4px 0 0" }}>
              Try a different search term.
            </p>
          </div>
        )}
    </div>
    </PageTransition>
  );
}
