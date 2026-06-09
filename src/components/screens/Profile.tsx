"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Edit3, MapPin, Mail, MessageCircle, Users, FileText, Globe, Briefcase } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Modal } from "@/components/Modal";
import { apiGet, apiSend } from "@/lib/api/client";
import { formatPostTime } from "@/lib/utils/time";
import type { Post, User } from "@/lib/mock";

export function Profile() {
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const posts = useQuery({ queryKey: ["posts"], queryFn: () => apiGet<Post[]>("/api/posts") });
  const weekly = useQuery({ queryKey: ["weekly-count"], queryFn: () => apiGet<{ count: number; remaining: number }>("/api/messages/weekly-count") });
  const update = useMutation({
    mutationFn: (body: Partial<User>) => apiSend<User>(`/api/users/${me.data?.id}`, "PATCH", body),
    onSuccess: () => {
      setEditing(false);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  if (me.isLoading) return <div className="skeleton" />;
  if (me.error || !me.data) return <ErrorState retry={() => void me.refetch()} />;
  const currentUser = me.data;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    update.mutate({
      full_name: String(form.get("full_name") ?? ""),
      industry: String(form.get("industry") ?? ""),
      career_stage: String(form.get("career_stage") ?? ""),
      city: String(form.get("city") ?? ""),
      bio: String(form.get("bio") ?? ""),
    });
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setAvatarPreview(dataUrl);
      update.mutate({ avatar_url: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  async function handleBannerChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setBannerPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/banner', { method: 'POST', body: formData });
      if (res.ok) {
        const { url } = await res.json();
        await update.mutateAsync({ banner_url: url });
      }
    } catch (err) {
      console.error('Banner upload error:', err);
    }
  }

  const displayAvatar = avatarPreview || currentUser.avatar_url;
  const displayBanner = bannerPreview || currentUser.banner_url;
  const userPosts = posts.data?.filter((post) => post.user_id === currentUser.id) ?? [];
  const bioTruncated = currentUser.bio && currentUser.bio.length > 150 && !bioExpanded;

  return (
    <div>
      {/* Cover Banner */}
      <div className="profile-banner" style={{
        height: 140,
        borderRadius: "var(--radius-card) var(--radius-card) 0 0",
        background: displayBanner
          ? `url(${displayBanner}) center/cover no-repeat`
          : "linear-gradient(120deg, #0D1B1E, #1A6B5C 62%, #C9A84C)",
        position: "relative",
        overflow: "hidden",
      }}>
        <button
          className="banner-upload-btn"
          onClick={() => bannerInputRef.current?.click()}
          aria-label="Upload banner image"
        >
          <Camera size={16} />
        </button>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          style={{ display: "none" }}
          onChange={handleBannerChange}
        />
      </div>

      {/* Avatar */}
      <div style={{ padding: "0 var(--card-padding)", marginTop: -40, position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ position: "relative", display: "inline-flex" }}>
          <div style={{ borderRadius: "999px", display: "inline-flex", border: "3px solid var(--color-bg-dark)", boxShadow: "0 0 0 3px rgba(201,168,76,0.2)" }}>
            <Avatar name={currentUser.full_name} size={80} src={displayAvatar} />
          </div>
          <button
            className="avatar-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload profile picture"
          >
            <Camera size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </div>
        <button className="btn btn-ghost" style={{ minHeight: 36, padding: "0 14px", fontSize: 13 }} onClick={() => setEditing(true)}><Edit3 size={14} /> Edit Profile</button>
      </div>

      {/* Name & Bio Section */}
      <div style={{ padding: "12px var(--card-padding) 0" }}>
        <h1 style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
        }}>{currentUser.full_name}</h1>

        <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--color-muted-light)" }}>
          {[currentUser.industry, currentUser.career_stage].filter(Boolean).join(" · ") || "No industry set"}
        </p>

        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-muted-dark)" }}>
          <MapPin size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} />
          {currentUser.city}, {currentUser.country}
        </p>

        {currentUser.bio ? (
          <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.8)" }}>
            {bioTruncated ? currentUser.bio.slice(0, 150) + "..." : currentUser.bio}
            {currentUser.bio.length > 150 && (
              <button className="btn-link" style={{ marginLeft: 4, fontSize: 13 }} onClick={() => setBioExpanded(!bioExpanded)}>
                {bioExpanded ? "see less" : "see more"}
              </button>
            )}
          </div>
        ) : null}

        {currentUser.skills.length > 0 && (
          <div className="skill-scroll" style={{ marginTop: 10, display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
            {currentUser.skills.map((skill) => (
              <span key={skill} style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 10px",
                borderRadius: "100px",
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
                background: "rgba(94,205,181,0.1)",
                color: "var(--color-success)",
                border: "1px solid rgba(94,205,181,0.16)",
              }}>{skill}</span>
            ))}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div style={{ padding: "16px var(--card-padding)", display: "flex", gap: 0, borderBottom: "1px solid var(--line)", margin: "14px var(--card-padding) 0" }}>
        {[
          { label: "Connections", value: "0", icon: Users },
          { label: "Posts", value: String(userPosts.length), icon: FileText },
          { label: "Communities", value: "5", icon: Globe },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} style={{ flex: 1, textAlign: "center", padding: "8px 0" }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
            <div style={{ fontSize: 12, color: "var(--color-muted-light)", marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Icon size={12} /> {label}
            </div>
          </div>
        ))}
      </div>

      {/* Open to Opportunities Badge */}
      {currentUser.open_to_opportunities && (
        <div style={{
          margin: "14px var(--card-padding)",
          padding: "10px 14px",
          background: "var(--color-primary)",
          borderRadius: "var(--radius-card)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          fontWeight: 600,
          color: "#fff",
        }}>
          <Briefcase size={16} />
          Open to Opportunities — relevant roles and collaborations
        </div>
      )}

      {/* Connections & Posts */}
      <div style={{ padding: "0 var(--card-padding) var(--card-padding)" }}>
        {/* Connections Section */}
        <div className="card" style={{ marginTop: 14, padding: "var(--card-padding)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Connections</h3>
            <button className="btn-link" style={{ fontSize: 13, color: "var(--color-primary)" }}>See all</button>
          </div>
          <p className="muted" style={{ fontSize: 13, margin: 0 }}>Connect with professionals to grow your network</p>
        </div>

        {/* Posts Section */}
        <div style={{ marginTop: 14 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>Posts</h3>
          {userPosts.length > 0 ? userPosts.map((post) => (
            <div key={post.id} className="card" style={{ padding: "var(--card-padding)", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Avatar name={currentUser.full_name} size={36} src={displayAvatar} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: 14 }}>{currentUser.full_name}</strong>
                    <span style={{ fontSize: 11, color: "var(--color-muted-light)" }}>{formatPostTime(post.created_at)}</span>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.85)" }}>{post.content}</p>
                  <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 13, color: "var(--color-muted-light)" }}>
                    <span>❤️ {post.likes_count}</span>
                    <span>💬 {post.comments_count}</span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="card" style={{ padding: "var(--card-padding)", textAlign: "center" }}>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>No posts yet</p>
            </div>
          )}
        </div>

        {/* Weekly messaging */}
        <div className="card" style={{ marginTop: 14, padding: "var(--card-padding)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MessageCircle size={16} color="var(--color-primary)" />
            <strong style={{ fontSize: 14 }}>Weekly messaging counter</strong>
          </div>
          <p style={{ fontSize: 13, color: "var(--color-muted-light)", margin: "6px 0 0", lineHeight: 1.5 }}>
            Free users can send and receive messages from anyone, including Pro users. Sending is limited to 10 messages per week.
          </p>
          <div style={{ height: 8, borderRadius: 999, background: "rgba(26,107,92,0.14)", overflow: "hidden", marginTop: 10 }}>
            <div style={{
              width: `${Math.min(((weekly.data?.count ?? 0) / 10) * 100, 100)}%`,
              height: "100%",
              background: (weekly.data?.count ?? 0) >= 10 ? "#f87171" : "var(--color-primary)",
              borderRadius: 999,
              transition: "width 300ms ease"
            }} />
          </div>
          <p style={{ fontSize: 12, color: "var(--color-muted-light)", margin: "6px 0 0" }}>
            {weekly.data?.count ?? 0} of 10 messages used this week
          </p>
        </div>

        {/* Opportunities card */}
        <div className="card" style={{ marginTop: 14, padding: "var(--card-padding)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Mail size={16} color="var(--color-primary)" />
            <strong style={{ fontSize: 14 }}>Opportunities</strong>
          </div>
          <p style={{ fontSize: 13, color: "var(--color-muted-light)", margin: "6px 0 0" }}>
            {currentUser.open_to_opportunities ? "Open to relevant roles and collaborations." : "Not currently open to opportunities."}
          </p>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              borderRadius: "100px",
              fontSize: 12,
              fontWeight: 600,
              background: currentUser.open_to_opportunities ? "rgba(94,205,181,0.12)" : "rgba(255,255,255,0.05)",
              color: currentUser.open_to_opportunities ? "var(--color-success)" : "var(--color-muted-light)",
              border: "1px solid rgba(94,205,181,0.16)",
            }}>
              {currentUser.open_to_opportunities ? "Open to Opportunities" : "Not open to opportunities"}
            </span>
            <span style={{ fontSize: 12, color: "var(--color-muted-light)" }}>
              Photo visible: {currentUser.show_photo ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>

      {editing ? (
        <Modal title="Edit profile" onClose={() => setEditing(false)}>
          <form className="grid" onSubmit={submit}>
            <input className="input" name="full_name" defaultValue={currentUser.full_name} placeholder="Full name" />
            <input className="input" name="industry" defaultValue={currentUser.industry} placeholder="Industry" />
            <input className="input" name="career_stage" defaultValue={currentUser.career_stage} placeholder="Career stage" />
            <input className="input" name="city" defaultValue={currentUser.city} placeholder="City" />
            <textarea className="textarea" name="bio" defaultValue={currentUser.bio} placeholder="Bio" rows={4} />
            <button className="btn btn-primary" disabled={update.isPending}>Save changes</button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 18 }}>Profile did not load</h2>
      <button className="btn btn-primary" onClick={retry} style={{ marginTop: 12 }}>Retry</button>
    </div>
  );
}
