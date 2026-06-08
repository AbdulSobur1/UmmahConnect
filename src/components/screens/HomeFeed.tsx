"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Heart, MessageCircle, Send, Share2, Star, Sunrise } from "lucide-react";
import { FormEvent } from "react";
import { Avatar } from "@/components/Avatar";
import { apiGet, apiSend } from "@/lib/api/client";
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

  if (posts.isLoading || me.isLoading) return <LoadingFeed />;
  if (posts.error || me.error) return <ErrorState retry={() => { void posts.refetch(); void me.refetch(); }} />;

  const currentUser = me.data;
  const event = events.data?.[0];

  return (
    <div>
      <div className="screen-title">
        <div>
          <h1>Home Feed</h1>
          <p className="muted">Assalamu Alaikum, {currentUser?.full_name.split(" ")[0]} 👋</p>
        </div>
        <span className="pill">{weekly.data?.count ?? 0} of 10 messages used this week</span>
      </div>

      <div className="grid two-col">
        <section className="grid">
          <div className="card card--strong">
            <div className="row space-between">
              <div className="row">
                <Sunrise color="#5ECDB5" />
                <div>
                  <strong>Next prayer in {currentUser?.city}</strong>
                  <p className="muted" style={{ margin: "4px 0 0" }}>
                    {prayer.data ? `${prayer.data.name} · ${prayer.data.time} · in ${prayer.data.minutes_until} min` : "Loading prayer time..."}
                  </p>
                </div>
              </div>
              <span className="pill">Today</span>
            </div>
          </div>

          <form className="card" onSubmit={submitPost}>
            <div className="row">
              <Avatar name={currentUser?.full_name ?? "User"} />
              <textarea className="textarea" name="content" placeholder="Share a win, question, opportunity, or reflection..." />
            </div>
            <div className="row row--wrap space-between">
              <div className="row row--wrap">
                {(communities.data ?? []).slice(0, 4).map((community) => (
                  <span className="pill" key={community.id}>{community.name}</span>
                ))}
              </div>
              <button className="btn btn-primary" disabled={createPost.isPending}><Send size={16} /> Post</button>
            </div>
          </form>

          {(posts.data ?? []).length === 0 ? (
            <div className="card" style={{ padding: 20 }}><strong>No posts yet — be the first to share with your community</strong></div>
          ) : null}

          {(posts.data ?? []).map((post) => (
            <article className="card" key={post.id}>
              <div className="row space-between">
                <div className="row">
                  <Avatar name={post.user.full_name} />
                  <div>
                    <strong>{post.user.full_name}</strong>
                    <p className="muted" style={{ margin: 0 }}>{post.user.industry} · {post.created_at}</p>
                  </div>
                </div>
                <span className="pill">{post.user.city}</span>
              </div>
              <p style={{ fontSize: 17, lineHeight: 1.7 }}>{post.content}</p>
              <div className="row" style={{ color: "#6B7E78" }}>
                <span className="row"><Heart size={17} /> {post.likes_count}</span>
                <span className="row"><MessageCircle size={17} /> {post.comments_count}</span>
                <span className="row"><Share2 size={17} /> Share</span>
              </div>
            </article>
          ))}
        </section>

        <aside className="grid" style={{ alignContent: "start" }}>
          {event ? (
            <article className="card sponsored-card">
              <div className="row space-between"><strong className="sponsored-label"><Star size={15} /> Sponsored Event</strong><CalendarDays color="#C9A84C" /></div>
              <h2 className="font-display">{event.title}</h2>
              <p className="muted">{event.event_date} · {event.location_detail} · {event.location_type}</p>
              <button className="btn btn-accent" onClick={() => void apiSend(`/api/events/${event.id}/click`, "POST")}>Register interest</button>
            </article>
          ) : null}

          <article className="card">
            <div className="row space-between"><strong>Community quick-links</strong></div>
            <div className="community-scroll" style={{ marginTop: 14 }}>
              {(communities.data ?? []).slice(0, 6).map((community) => (
                <span className="pill" key={community.id}>{community.name}</span>
              ))}
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}

function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <h2>Something did not load</h2>
      <p className="muted">Please try again in a moment.</p>
      <button className="btn btn-primary" onClick={retry}>Retry</button>
    </div>
  );
}
