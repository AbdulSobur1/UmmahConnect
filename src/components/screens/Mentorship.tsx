"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown, Crown, Sparkles, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageTransition, Stagger } from "@/components/ui/PageTransition";
import { useToast } from "@/components/ui/Toast";
import { apiGet, apiSend } from "@/lib/api/client";
import type { MentorProfile, User } from "@/types";

export function Mentorship() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [requestedMentorId, setRequestedMentorId] = useState<string | null>(null);
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const mentors = useQuery({ queryKey: ["mentor-matches"], queryFn: () => apiGet<MentorProfile[]>("/api/mentorship/matches"), retry: false });
  const profiles = useQuery({ queryKey: ["mentor-profiles"], queryFn: () => apiGet<MentorProfile[]>("/api/mentorship/profiles"), enabled: Boolean(mentors.error) });
  const { toast } = useToast();
  const requestMentorship = useMutation({
    mutationFn: (mentor_id: string) => apiSend("/api/mentorship/requests", "POST", { mentor_id }),
    onSuccess: (_, mentorId) => {
      setRequestedMentorId(mentorId);
      toast("Request sent", "success");
    },
    onError: () => {
      toast("Request could not be sent.", "error");
    },
  });
  const currentUser = me.data;
  const list = mentors.data ?? profiles.data ?? [];

  if (mentors.isLoading || me.isLoading) return <div className="skeleton" />;

  const profileTags = currentUser ? [currentUser.industry, currentUser.career_stage, currentUser.city].filter(Boolean) : [];

  return (
    <PageTransition>
      <div className="screen-title"><div><h1>Mentorship</h1><p className="muted">Match with mentors by industry, stage, language, location, and values.</p></div></div>

      {profileTags.length > 0 ? (
        <Card padding="lg" style={{ marginBottom: 18, background: "var(--color-bg-secondary)" }}>
          <div className="row"><Sparkles color="var(--color-success)" /><div><strong>Your match profile</strong><p style={{ color: "var(--color-text-muted)", marginBottom: 0 }}>Based on your profile data</p></div></div>
          <div className="row" style={{ flexWrap: "wrap", marginTop: 10, gap: 8 }}>{profileTags.map((tag) => <span className="pill" key={tag}>{tag}</span>)}</div>
        </Card>
      ) : null}

      {mentors.error ? <Card variant="sponsored" padding="lg" style={{ marginBottom: 18 }}>
        <div className="row space-between" style={{ flexWrap: "wrap", gap: 12 }}>
          <div className="row"><Crown color="var(--color-accent)" /><div><strong>Unlock full mentorship matching</strong><p className="muted" style={{ margin: "4px 0 0" }}>Free users can browse mentors — upgrade to send requests and see scored matches.</p></div></div>
          <Button variant="accent" icon={<Crown size={16} />} onClick={() => window.location.href = "/settings"}>Upgrade</Button>
        </div>
      </Card> : null}

      {requestMentorship.error ? <Card padding="md" style={{ marginBottom: 18 }}><strong>Request not sent.</strong><p className="muted">Please try again or check your account access.</p></Card> : null}

      <Stagger as="section" className="grid three-col" style={{ gap: "var(--item-gap)" }}>
        {list.length > 0 ? list.map((mentor) => {
          const isOpen = expanded === mentor.user_id;
          const requested = requestedMentorId === mentor.user_id;
          const matchPct = mentor.match_score ?? 0;
          const matchColor = matchPct >= 80 ? "var(--color-success)" : matchPct >= 50 ? "var(--color-accent)" : "var(--color-text-muted)";
          return (
            <Card padding="lg" key={mentor.user_id}>
              <div className="row space-between" style={{ marginBottom: 8 }}>
                <span className="pill" style={{ background: matchPct >= 80 ? "var(--color-success-light)" : "var(--color-bg-hover)", color: matchColor }}>{matchPct}% match</span>
                <Button variant="ghost" size="sm" icon={isOpen ? <X size={16} /> : <ChevronDown size={16} />} onClick={() => setExpanded(isOpen ? null : mentor.user_id)}><></></Button>
              </div>
              <h2 className="font-display" style={{ fontSize: 26, margin: "4px 0" }}>{mentor.full_name}</h2>
              <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 0 8px" }}><strong>{mentor.role}</strong> · {mentor.city}</p>
              <div className="row" style={{ flexWrap: "wrap", gap: 4 }}>{mentor.industries.slice(0, 3).map((industry) => <span className="pill" key={industry} style={{ fontSize: 11 }}>{industry}</span>)}</div>
              {isOpen ? <>
                <div style={{ height: 1, background: "var(--color-line-light)", margin: "12px 0" }} />
                {mentor.bio && <p className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>{mentor.bio}</p>}
                {mentor.values_tags.length > 0 && <div className="row" style={{ flexWrap: "wrap", gap: 4, marginTop: 8 }}>{mentor.values_tags.map((tag) => <span className="pill" key={tag} style={{ fontSize: 11 }}>{tag}</span>)}</div>}
                <Button
                  variant={mentors.error ? "accent" : "primary"}
                  fullWidth
                  style={{ marginTop: 14 }}
                  disabled={requestMentorship.isPending || requested}
                  onClick={() => requestMentorship.mutate(mentor.user_id)}
                >
                  {requested ? "Request sent ✓" : mentors.error ? <><Crown size={14} /> Upgrade to connect</> : "Request mentorship"}
                </Button>
              </> : null}
            </Card>
          );
        }) : (
          <div style={{ gridColumn: "1 / -1" }}>
            <EmptyState
              icon={<UserRound size={28} />}
              title="No mentors found yet"
              description="Mentors will appear here based on your profile and match data. Make sure your profile is complete."
            />
          </div>
        )}
      </Stagger>
    </PageTransition>
  );
}
