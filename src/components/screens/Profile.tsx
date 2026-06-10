"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Edit3, MapPin, MessageCircle, Mail, Users, FileText, Globe, Briefcase } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Modal } from "@/components/Modal";
import { apiGet, apiSend } from "@/lib/api/client";
import { formatPostTime } from "@/lib/utils/time";
import { ErrorState, InfoCard, ProgressBar, Tag } from "@/components/ui/Common";
import type { Post, User } from "@/types";

export function Profile() {
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
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
  if (me.error || !me.data) return <ErrorState onRetry={() => void me.refetch()} title="Profile did not load" />;
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
    const reader = new FileReader();
    reader.onload = (e) => {
      setBannerPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setUploadingBanner(true);
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
    } finally {
      setUploadingBanner(false);
    }
  }

  const displayAvatar = avatarPreview || currentUser.avatar_url;
  const displayBanner = bannerPreview || currentUser.banner_url;
  const userPosts = posts.data?.filter((post) => post.user_id === currentUser.id) ?? [];
  const bioTruncated = currentUser.bio && currentUser.bio.length > 150 && !bioExpanded;

  return (
    <div>
      {/* 1. Cover banner */}
      <div
        className="profile-banner"
        style={{
          height: 140,
          borderRadius: "16px 16px 0 0",
          background: displayBanner
            ? `url(${displayBanner}) center/cover no-repeat`
            : "linear-gradient(120deg, #1A6B5C, #C9A84C)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <button
          className="banner-upload-btn"
          onClick={() => bannerInputRef.current?.click()}
          aria-label="Upload banner image"
        >
          {uploadingBanner ? <span style={{ fontSize: 10 }}>...</span> : <Camera size={16} />}
        </button>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          style={{ display: "none" }}
          onChange={handleBannerChange}
        />
      </div>

      {/* 2. Avatar + Edit button */}
      <div
        style={{
          padding: "0 20px",
          marginTop: -40,
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div style={{ position: "relative", display: "inline-flex" }}>
          <div
            style={{
              borderRadius: "999px",
              display: "inline-flex",
              border: "3px solid #0D1B1E",
              boxShadow: "0 0 0 3px rgba(201,168,76,0.2)",
            }}
          >
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
        <button
          className="btn-ghost"
          style={{
            minHeight: 36,
            padding: "0 14px",
            fontSize: 13,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 100,
            background: "transparent",
            color: "rgba(255,255,255,0.55)",
          }}
          onClick={() => setEditing(true)}
        >
          <Edit3 size={14} /> Edit Profile
        </button>
      </div>

      {/* 3. Name + Industry + Location + Bio + Skills */}
      <div style={{ padding: "12px 20px 0" }}>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          {currentUser.full_name}
        </h1>

        <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
          {[currentUser.industry, currentUser.career_stage].filter(Boolean).join(" · ") || "No industry set"}
        </p>

        <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 4 }}>
          <MapPin size={12} />
          {currentUser.city}, {currentUser.country}
        </p>

        {currentUser.bio ? (
          <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.8)" }}>
            {bioTruncated ? currentUser.bio.slice(0, 150) + "..." : currentUser.bio}
            {currentUser.bio.length > 150 && (
              <button
                className="btn-link"
                style={{ marginLeft: 4, fontSize: 13, color: "rgba(255,255,255,0.55)" }}
                onClick={() => setBioExpanded(!bioExpanded)}
              >
                {bioExpanded ? "see less" : "see more"}
              </button>
            )}
          </div>
        ) : null}

        {currentUser.skills.length > 0 && (
          <div
            className="skill-scroll"
            style={{
              marginTop: 10,
              display: "flex",
              gap: 6,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {currentUser.skills.map((skill) => (
              <Tag key={skill}>{skill}</Tag>
            ))}
          </div>
        )}
      </div>

      {/* 4. Stats row */}
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          gap: 0,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          margin: "14px 20px 0",
        }}
      >
        {[
          { label: "Connections", value: "0", icon: Users },
          { label: "Posts", value: String(userPosts.length), icon: FileText },
          { label: "Communities", value: "5", icon: Globe },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} style={{ flex: 1, textAlign: "center", padding: "8px 0" }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
                marginTop: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <Icon size={12} /> {label}
            </div>
          </div>
        ))}
      </div>

      {/* 5. Open to Opportunities */}
      {currentUser.open_to_opportunities && (
        <div
          style={{
            margin: "14px 20px",
            padding: "10px 14px",
            background: "#1A6B5C",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
          }}
        >
          <Briefcase size={16} />
          ✓ Open to Opportunities
        </div>
      )}

      {/* 6. Connections & Posts */}
      <div style={{ padding: "0 20px 20px" }}>
        {/* Connections Section */}
        <div
          style={{
            background: "#132420",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: 16,
            marginTop: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Connections</h3>
            <button className="btn-link" style={{ fontSize: 13, color: "#1A6B5C" }}>See all</button>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0 }}>
            Connect with professionals to grow your network
          </p>
        </div>

        {/* Posts Section */}
        <div style={{ marginTop: 14 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px", fontFamily: "'DM Sans', sans-serif" }}>
            Posts
          </h3>
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <div
                key={post.id}
                style={{
                  background: "#132420",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Avatar name={currentUser.full_name} size={36} src={displayAvatar} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: 15 }}>{currentUser.full_name}</strong>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                        {formatPostTime(post.created_at)}
                      </span>
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.85)" }}>
                      {post.content}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 16,
                        marginTop: 8,
                        fontSize: 13,
                        color: "rgba(255,255,255,0.55)",
                      }}
                    >
                      <span>❤️ {post.likes_count}</span>
                      <span>💬 {post.comments_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                background: "#132420",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: 16,
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0 }}>No posts yet</p>
            </div>
          )}
        </div>

        <InfoCard
          icon={<MessageCircle size={16} color="#1A6B5C" />}
          title="Weekly messaging counter"
          description="Free users can send and receive messages from anyone, including Pro users. Sending is limited to 10 messages per week."
          extra={
            <>
              <ProgressBar value={weekly.data?.count ?? 0} height={8} />
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "6px 0 0" }}>
                {weekly.data?.count ?? 0} of 10 messages used this week
              </p>
            </>
          }
        />

        <InfoCard
          icon={<Mail size={16} color="#1A6B5C" />}
          title="Opportunities"
          description={currentUser.open_to_opportunities ? "Open to relevant roles and collaborations." : "Not currently open to opportunities."}
          extra={
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Tag variant={currentUser.open_to_opportunities ? "green" : "dark"}>
                {currentUser.open_to_opportunities ? "Open to Opportunities" : "Not open to opportunities"}
              </Tag>
            </div>
          }
        />
      </div>

      {/* Edit Modal */}
      {editing ? (
        <Modal title="Edit profile" onClose={() => setEditing(false)}>
          <form
            className="grid"
            onSubmit={submit}
            style={{ display: "grid", gap: 16 }}
          >
            <input className="input" name="full_name" defaultValue={currentUser.full_name} placeholder="Full name" />
            <input className="input" name="industry" defaultValue={currentUser.industry} placeholder="Industry" />
            <input className="input" name="career_stage" defaultValue={currentUser.career_stage} placeholder="Career stage" />
            <input className="input" name="city" defaultValue={currentUser.city} placeholder="City" />
            <textarea className="textarea" name="bio" defaultValue={currentUser.bio} placeholder="Bio" rows={4} />
            <button className="btn btn-primary" disabled={update.isPending} style={{ borderRadius: 100 }}>
              Save changes
            </button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
