"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays, Send, Star, Sunrise,
  MessageSquare, Image, Globe, FileText, Sparkles,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PostCard } from "@/components/ui/PostCard";
import { ProgressBar, Tag } from "@/components/ui/Common";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { apiGet, apiSend } from "@/lib/api/client";
import type { Community, EventListing, Post, User } from "@/types";

type Prayer = { name: string; time: string; minutes_until: number };
type Weekly = { count: number; remaining: number; week_start: string };

function LoadingFeed() {
  return (
    <div className="grid stagger-children">
      <div className="skeleton" style={{ minHeight: 120 }} />
      <div className="skeleton" style={{ minHeight: 160 }} />
      <div className="skeleton" style={{ minHeight: 100 }} />
    </div>
  );
}

export function HomeFeed() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const posts = useQuery({ queryKey: ["posts"], queryFn: () => apiGet<Post[]>("/api/posts") });
  const communities = useQuery({ queryKey: ["communities"], queryFn: () => apiGet<Community[]>("/api/communities") });
  const events = useQuery({ queryKey: ["events"], queryFn: () => apiGet<EventListing[]>("/api/events") });
  const prayer = useQuery({ queryKey: ["prayer-times"], queryFn: () => apiGet<Prayer>("/api/prayer-times") });
  const weekly = useQuery({ queryKey: ["weekly-count"], queryFn: () => apiGet<Weekly>("/api/messages/weekly-count") });
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [animatingLike, setAnimatingLike] = useState<string | null>(null);
  const createPost = useMutation({
    mutationFn: (content: string) => apiSend<Post>("/api/posts", "POST", { content }),
    onSuccess: () => {
      toast("Post shared with your community", "success");
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      toast("Post could not be shared.", "error");
    },
  });
  const toggleLike = useMutation({
    mutationFn: (postId: string) => apiSend<{ liked: boolean; likes_count: number }>(`/api/posts/${postId}/like`, "POST"),
    onSuccess: (data, postId) => {
      setAnimatingLike(postId);
      setTimeout(() => setAnimatingLike(null), 300);
      setLikedPosts((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(postId);
        else next.delete(postId);
        return next;
      });
    },
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
    <div className="animate-fade-in">
      {/* Feed header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, color: "var(--color-text-muted)", marginBottom: 8 }} className="animate-fade-in">
          {greeting}
        </div>
        {/* Prayer time strip */}
        <div className="card hover-lift" style={{
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
        <form className="card transition-normal" onSubmit={submitPost} style={{
          padding: 14,
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        }}
          onFocusCapture={(e) => {
            const card = e.currentTarget;
            card.style.borderColor = "rgba(26,107,92,0.4)";
            card.style.boxShadow = "0 0 0 3px rgba(26,107,92,0.1)";
          }}
          onBlurCapture={(e) => {
            const card = e.currentTarget;
            card.style.borderColor = "rgba(255,255,255,0.06)";
            card.style.boxShadow = "none";
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Avatar name={currentUser?.full_name ?? "User"} size={36} />
            <textarea
              className="textarea transition-normal"
              name="content"
              placeholder="Share something with your community..."
              rows={2}
              style={{
                resize: "none",
                minHeight: 44,
                fontSize: 14,
                padding: "10px 14px",
                transition: "min-height 0.2s ease",
              }}
              onFocus={(e) => { e.currentTarget.style.minHeight = "72px"; }}
              onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.style.minHeight = "44px"; }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { icon: Image, label: "Photo" },
                { icon: Globe, label: "Community" },
                { icon: FileText, label: "Article" },
              ].map(({ icon: Icon, label }) => (
                <Button
                  key={label}
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<Icon size={14} />}
                >
                  {label}
                </Button>
              ))}
            </div>
            <Button
              type="submit"
              disabled={createPost.isPending}
              loading={createPost.isPending}
              icon={<Send size={14} />}
              style={{ minHeight: 36, fontSize: 13, padding: "0 16px" }}
            >
              {createPost.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      </div>

      {/* Feed grid */}
      <div className="grid two-col" style={{ gap: 16 }}>
        <section className="grid stagger-children" style={{ gap: 12 }}>
          {/* Error state */}
          {posts.error ? (
            <Card padding="xl" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
              <strong style={{ fontSize: 18 }}>Couldn&apos;t load your feed</strong>
              <p className="muted" style={{ fontSize: 14, margin: "6px 0 16px" }}>Check your connection and try again.</p>
              <Button variant="accent" size="sm" onClick={() => void posts.refetch()}>Retry</Button>
            </Card>
          ) : posts.isLoading ? (
            <LoadingFeed />
          ) : (posts.data ?? []).length === 0 ? (
            <EmptyState
              icon={<Sparkles size={28} />}
              title="No posts yet"
              description="Be the first to share something meaningful with your community."
            />
          ) : (
            (posts.data ?? []).map((post, index) => {
              const isExpanded = expandedPosts.has(post.id);
              const isLiked = likedPosts.has(post.id);
              const isAnimatingLike = animatingLike === post.id;

              return (
                <PostCard
                  key={post.id}
                  post={post}
                  isExpanded={isExpanded}
                  isLiked={isLiked}
                  isAnimatingLike={isAnimatingLike}
                  onToggleExpand={toggleExpand}
                  onLike={(postId) => toggleLike.mutate(postId)}
                  index={index}
                />
              );
            })
          )}
        </section>

        {/* Sidebar */}
        <aside className="grid stagger-children" style={{ gap: 12, alignContent: "start" }}>
          {/* Sponsored event */}
          {event ? (
            <article className="sponsored-card hover-lift transition-normal" style={{ padding: 14 }}>
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
                className="btn btn-accent transition-fast hover-lift"
                style={{ marginTop: 10, fontSize: 13, minHeight: 36, padding: "0 14px" }}
                onClick={() => void apiSend(`/api/events/${event.id}/click`, "POST")}
              >
                Register interest
              </button>
            </article>
          ) : null}

          {/* Community quick-links */}
          {(communities.data ?? []).length > 0 ? (
            <article className="card transition-normal" style={{ padding: 14 }}>
              <strong style={{ fontSize: 14, marginBottom: 10, display: "block" }}>Community quick-links</strong>
              <div className="community-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", marginTop: 6, paddingBottom: 4 }}>
                {(communities.data ?? []).slice(0, 6).map((community) => (
                  <Tag key={community.id} className="transition-fast hover-lift" style={{ cursor: "pointer" }}>{community.name}</Tag>
                ))}
              </div>
            </article>
          ) : null}

          <article className="card transition-normal" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MessageSquare size={15} color="var(--color-text-muted)" />
              <strong style={{ fontSize: 13 }}>Weekly messaging</strong>
            </div>
            <div style={{ marginTop: 8 }}>
              <ProgressBar value={weeklyCount} height={6} />
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>
              {weeklyCount} of 10 messages used this week
            </p>
          </article>
        </aside>
      </div>
    </div>
  );
}
