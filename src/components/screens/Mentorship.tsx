"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";
import { apiGet } from "@/lib/api/client";
import type { MentorProfile } from "@/lib/mock";

export function Mentorship() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const mentors = useQuery({ queryKey: ["mentor-matches"], queryFn: () => apiGet<MentorProfile[]>("/api/mentorship/matches"), retry: false });
  const profiles = useQuery({ queryKey: ["mentor-profiles"], queryFn: () => apiGet<MentorProfile[]>("/api/mentorship/profiles"), enabled: Boolean(mentors.error) });
  const list = mentors.data ?? profiles.data ?? [];

  if (mentors.isLoading) return <div className="skeleton" />;

  return (
    <div>
      <div className="screen-title"><div><h1>Mentorship</h1><p className="muted">Match with mentors by industry, stage, language, location, and values.</p></div><span className="pill">Full access with Pro</span></div>
      {mentors.error ? <div className="card" style={{ padding: 18, marginBottom: 18 }}><strong>Pro required for full scored matches.</strong><p className="muted">Showing available mentor profiles while upgrade access is locked.</p></div> : null}
      <div className="card" style={{ padding: 22, marginBottom: 18, background: "#132420", color: "#FAF7F2" }}><div className="row"><Sparkles color="#5ECDB5" /><div><strong>Your match profile</strong><p style={{ color: "rgba(255,255,255,0.62)", marginBottom: 0 }}>Industry · Career stage · Location · Values</p></div></div></div>
      <div className="grid three-col">
        {list.map((mentor) => {
          const isOpen = expanded === mentor.user_id;
          return (
            <article className="card" style={{ padding: 20 }} key={mentor.user_id}>
              <div className="row space-between"><span className="pill">{mentor.match_score ?? 0}% match</span><button className="btn btn-ghost" onClick={() => setExpanded(isOpen ? null : mentor.user_id)}><ChevronDown size={18} /></button></div>
              <h2 className="font-display" style={{ fontSize: 30 }}>{mentor.full_name}</h2><p><strong>{mentor.role}</strong> · {mentor.city}</p>
              <div className="row" style={{ flexWrap: "wrap" }}>{mentor.industries.map((industry) => <span className="pill" key={industry}>{industry}</span>)}</div>
              {isOpen ? <><p className="muted">{mentor.bio}</p><div className="row" style={{ flexWrap: "wrap" }}>{mentor.values_tags.map((tag) => <span className="pill" key={tag}>{tag}</span>)}</div><button className="btn btn-primary" style={{ marginTop: 14 }}>Request mentorship</button></> : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
