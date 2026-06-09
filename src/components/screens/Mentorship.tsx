"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown, Crown, LockKeyhole, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { apiGet, apiSend } from "@/lib/api/client";
import type { MentorProfile, User } from "@/lib/mock";

export function Mentorship() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [requestedMentorId, setRequestedMentorId] = useState<string | null>(null);
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const mentors = useQuery({ queryKey: ["mentor-matches"], queryFn: () => apiGet<MentorProfile[]>("/api/mentorship/matches"), retry: false });
  const profiles = useQuery({ queryKey: ["mentor-profiles"], queryFn: () => apiGet<MentorProfile[]>("/api/mentorship/profiles"), enabled: Boolean(mentors.error) });
  const requestMentorship = useMutation({
    mutationFn: (mentor_id: string) => apiSend("/api/mentorship/requests", "POST", { mentor_id }),
    onSuccess: (_, mentorId) => setRequestedMentorId(mentorId),
  });
  const currentUser = me.data;
  const list = mentors.data ?? profiles.data ?? [];

  if (mentors.isLoading || me.isLoading) return <div className="skeleton" />;

  const profileTags = currentUser ? [currentUser.industry, currentUser.career_stage, currentUser.city].filter(Boolean) : [];

  return (
    <div>
      <div className="screen-title"><div><h1>Mentorship</h1><p className="muted">Match with mentors by industry, stage, language, location, and values.</p></div></div>

      {profileTags.length > 0 ? (
        <div className="card" style={{ padding: 22, marginBottom: 18, background: "#132420", color: "#FAF7F2" }}>
          <div className="row"><Sparkles color="#5ECDB5" /><div><strong>Your match profile</strong><p style={{ color: "rgba(255,255,255,0.62)", marginBottom: 0 }}>Based on your profile data</p></div></div>
          <div className="row" style={{ flexWrap: "wrap", marginTop: 10, gap: 8 }}>{profileTags.map((tag) => <span className="pill" key={tag}>{tag}</span>)}</div>
        </div>
      ) : null}

      {mentors.error ? <div className="card" style={{ padding: 18, marginBottom: 18, borderColor: "rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.06)" }}>
        <div className="row space-between" style={{ flexWrap: "wrap", gap: 12 }}>
          <div className="row"><Crown color="#C9A84C" /><div><strong>Unlock full mentorship matching</strong><p className="muted" style={{ margin: "4px 0 0" }}>Free users can browse mentors — upgrade to send requests and see scored matches.</p></div></div>
          <button className="btn btn-accent" onClick={() => window.location.href = "/settings"}><Crown size={16} /> Upgrade</button>
        </div>
      </div> : null}

      {requestMentorship.error ? <div className="card" style={{ padding: 18, marginBottom: 18 }}><strong>Request not sent.</strong><p className="muted">Please try again or check your account access.</p></div> : null}

      <div className="grid three-col">
        {list.length > 0 ? list.map((mentor) => {
          const isOpen = expanded === mentor.user_id;
          const requested = requestedMentorId === mentor.user_id;
          return (
            <article className="card" style={{ padding: 20, position: "relative" }} key={mentor.user_id}>
              <div className="row space-between"><span className="pill">{mentor.match_score ?? 0}% match</span><button className="btn btn-ghost" onClick={() => setExpanded(isOpen ? null : mentor.user_id)}><ChevronDown size={18} /></button></div>
              <h2 className="font-display" style={{ fontSize: 30 }}>{mentor.full_name}</h2><p><strong>{mentor.role}</strong> · {mentor.city}</p>
              <div className="row" style={{ flexWrap: "wrap" }}>{mentor.industries.map((industry) => <span className="pill" key={industry}>{industry}</span>)}</div>
              {isOpen ? <><p className="muted">{mentor.bio}</p><div className="row" style={{ flexWrap: "wrap" }}>{mentor.values_tags.map((tag) => <span className="pill" key={tag}>{tag}</span>)}</div><button className="btn btn-primary" style={{ marginTop: 14 }} disabled={requestMentorship.isPending || requested} onClick={() => requestMentorship.mutate(mentor.user_id)}>{requested ? "Request sent" : "Request mentorship"}</button></> : null}
              {mentors.error ? <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: "rgba(13,27,30,0.5)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}><LockKeyhole size={24} color="#C9A84C" /><span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600 }}>Upgrade to connect</span></div> : null}
            </article>
          );
        }) : (
          <div className="card" style={{ padding: 28, textAlign: "center", gridColumn: "1 / -1" }}>
            <UserRound size={36} color="#6B7E78" style={{ marginBottom: 12 }} />
            <strong>No mentors found yet</strong>
            <p className="muted" style={{ margin: "6px 0 0" }}>Mentors will appear here based on your profile match data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
