"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays, Heart, MessageCircle, Send, Share2, Star, Sunrise,
  MessageSquare, Image, Globe, FileText,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { ProgressBar, Tag } from "@/components/ui/Common";
import { apiGet, apiSend } from "@/lib/api/client";
import { formatPostTime } from "@/lib/utils/time";
import type { Community, EventListing, Post, User } from "@/lib/mock";

type Prayer = { name: string; time: string; minutes_until: number };
type Weekly = { count: number; remaining: number; week_start: string };

function LoadingFeed() {
  return (
    <div className="grid">
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}

export function HomeFeed() {
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const posts = useQuery({ queryKey: ["posts"], queryFn: () => apiGet<Post[]>("/api/posts") });
  const communities = useQuery({ queryKey: ["communities"], queryFn: () => apiGet<Community[]>("/api/communities") });
  const events = useQuery({ queryKey: ["events"], queryFn: () => apiGet<EventListing[]>("/api/events") });
  const prayer = useQuery({ queryKey: ["prayer-times"], queryFn: () => apiGet<Prayer>("/api/prayer-times") });
  const weekly = useQuery({ queryKey: ["weekly-count"], queryFn: () => apiGet<Weekly>("/api/messages/weekly-count") });
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const createPost = useMutation({
    mutationFn: (content: string) => apiSend<Post>("/api/posts", "POST", { content }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const content = String(form.get("content") ?? "");
    if (content.trim()) createPost.mutate(content);
    event.currentTarget.reset();
  }

  const currentUser = me.data;
  const event = events.data?.[0];
  const greeting = currentUser ? `Assalamu Alaikum, ${currentUser.full_name.split(" ")[0]} 👋` : "Assalamu Alaikum 👋";
  const weeklyCount = weekly.data?.count ?? 0;

  function toggleExpand(postId: string) {
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  return (
    <div>
      {/* Feed header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, color: "var(--color-muted-light)", marginBottom: 8 }}>{greeting}</div>
        {/* Prayer time strip */}
        <div className="card" style={{
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          minHeight: 36,
          background: "rgba(94,205,181,0.06)",
          border: "1px solid rgba(94,205,181,0.12)",
          marginBottom: 12,
        }}>
          <Sunrise size={16} color="var(--color-success)" />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
            {prayer.data
              ? `Next prayer: ${prayer.data.name} · ${prayer.data.time} · in ${prayer.data.minutes_until} min`
              : "🌙 Maghrib · 7:42 PM · in 34 min"}
          </span>
        </div>

        {/* Compose box */}
        <form className="card" onSubmit={submitPost} style={{ padding: 14 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Avatar name={currentUser?.full_name ?? "User"} size={36} />
            <textarea
              className="textarea"
              name="content"
              placeholder="Share something with your community..."
              rows={2}
              style={{ resize: "none", minHeight: 44, fontSize: 14, padding: "10px 14px" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" className="btn-ghost" style={{ fontSize: 12, padding: "4px 10px", minHeight: 32, display: "flex", alignItems: "center", gap: 4 }}>
                <Image size={14} /> Photo
              </button>
              <button type="button" className="btn-ghost" style={{ fontSize: 12, padding: "4px 10px", minHeight: 32, display: "flex", alignItems: "center", gap: 4 }}>
                <Globe size={14} /> Community
              </button>
              <button type="button" className="btn-ghost" style={{ fontSize: 12, padding: "4px 10px", minHeight: 32, display: "flex", alignItems: "center", gap: 4 }}>
                <FileText size={14} /> Article
              </button>
            </div>
            <button className="btn btn-primary" disabled={createPost.isPending} style={{ minHeight: 36, fontSize: 13, padding: "0 16px" }}>
              <Send size={14} /> Post
            </button>
          </div>
        </form>
      </div>

      {/* Feed grid */}
      <div className="grid two-col" style={{ gap: 16 }}>
        <section className="grid" style={{ gap: 12 }}>
          {/* Error state */}
          {posts.error ? (
            <div className="card" style={{ padding: 16, textAlign: "center" }}>
              <p className="muted" style={{ fontSize: 14 }}>Couldn&apos;t load your feed.</p>
              <button className="btn btn-accent" style={{ fontSize: 13, minHeight: 36 }} onClick={() => void posts.refetch()}>Retry</button>
            </div>
          ) : posts.isLoading ? (
            <LoadingFeed />
          ) : (posts.data ?? []).length === 0 ? (
            <div className="card" style={{ padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🌙</div>
              <strong style={{ fontSize: 18 }}>No posts yet</strong>
              <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>Be the first to share something meaningful.</p>
            </div>
          ) : (
            (posts.data ?? []).map((post) => {
              const isExpanded = expandedPosts.has(post.id);
              const contentLong = post.content.length > 200;
              const displayContent = isExpanded || !contentLong ? post.content : post.content.slice(0, 200) + "...";

              return (
                <article
                  key={post.id}
                  className="card"
                  style={{
                    padding: 14,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16,
                  }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Avatar name={post.user?.full_name ?? "User"} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <strong style={{ fontSize: 15 }}>{post.user?.full_name ?? "Unknown"}</strong>
                          <div style={{ fontSize: 13, color: "var(--color-muted-light)" }}>
                            {[post.user?.industry, post.user?.city].filter(Boolean).join(" · ") || ""}
                          </div>
                        </div>
                        <span style={{ fontSize: 12, color: "var(--color-muted-light)", whiteSpace: "nowrap", marginLeft: 8 }}>
                          {formatPostTime(post.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ marginTop: 10 }}>
                    <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, color: "rgba(255,255,255,0.9)" }}>
                      {displayContent}
                    </p>
                    {contentLong && (
                      <button className="btn-link" style={{ fontSize: 13, marginTop: 4, color: "var(--color-muted-light)" }}
                        onClick={() => toggleExpand(post.id)}>
                        {isExpanded ? "See less" : "See more"}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    fontSize: 14,
                    color: "var(--color-muted-light)",
                  }}>
                    <button className="btn-link" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: "inherit" }}>
                      <Heart size={16} /> {post.likes_count}
                    </button>
                    <button className="btn-link" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: "inherit" }}>
                      <MessageCircle size={16} /> {post.comments_count}
                    </button>
                    <button className="btn-link" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: "inherit", marginLeft: "auto" }}>
                      <Share2 size={16} /> Share
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* Sidebar */}
        <aside className="grid" style={{ gap: 12, alignContent: "start" }}>
          {/* Sponsored event */}
          {event ? (
            <article className="sponsored-card" style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: "var(--color-accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}>
                  <Star size={12} /> Sponsored
                </span>
                <CalendarDays size={14} color="var(--color-accent)" />
              </div>
              <h3 style={{ margin: "8px 0 4px", fontSize: 15, fontWeight: 700 }}>{event.title}</h3>
              <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                {event.event_date} · {event.location_detail}
              </p>
              <button
                className="btn btn-accent"
                style={{ marginTop: 10, fontSize: 13, minHeight: 36, padding: "0 14px" }}
                onClick={() => void apiSend(`/api/events/${event.id}/click`, "POST")}
              >
                Register interest
              </button>
            </article>
          ) : null}

          {/* Community quick-links */}
          {(communities.data ?? []).length > 0 ? (
            <article className="card" style={{ padding: 14 }}>
              <strong style={{ fontSize: 14, marginBottom: 10, display: "block" }}>Community quick-links</strong>
              <div className="community-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", marginTop: 6 }}>
                {(communities.data ?? []).slice(0, 6).map((community) => (
                  <Tag key={community.id}>{community.name}</Tag>
                ))}
              </div>
            </article>
          ) : null}

          <article className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MessageSquare size={15} color="var(--color-muted-light)" />
              <strong style={{ fontSize: 13 }}>Weekly messaging</strong>
            </div>
            <div style={{ marginTop: 8 }}>
              <ProgressBar value={weeklyCount} height={6} />
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-muted-light)" }}>
              {weeklyCount} of 10 messages used this week
            </p>
          </article>
        </aside>
      </div>
    </div>
  );
}
