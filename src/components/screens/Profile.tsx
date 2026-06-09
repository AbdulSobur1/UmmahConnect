"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Edit3, Mail, MapPin, MessageCircle } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Modal } from "@/components/Modal";
import { apiGet, apiSend } from "@/lib/api/client";
import type { Post, User } from "@/lib/mock";

export function Profile() {
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const displayAvatar = avatarPreview || currentUser.avatar_url;

  return (
    <div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ minHeight: 190, background: "linear-gradient(120deg, #0D1B1E, #1A6B5C 62%, #C9A84C)" }} />
        <div style={{ padding: 24, marginTop: -62 }}>
          <div style={{ position: "relative", display: "inline-flex" }}>
            <div style={{ borderRadius: "999px", display: "inline-flex", border: "3px solid #0D1B1E", boxShadow: "0 0 0 3px rgba(201,168,76,0.2)" }}>
              <Avatar name={currentUser.full_name} size={116} src={displayAvatar} />
            </div>
            <button
              className="avatar-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload profile picture"
            >
              <Camera size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>
          <div className="row space-between" style={{ alignItems: "flex-start", flexWrap: "wrap", marginTop: 14 }}>
            <div>
              <h1 className="font-display" style={{ margin: 0, fontSize: 48 }}>{currentUser.full_name}</h1>
              <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>{[currentUser.career_stage, currentUser.industry].filter(Boolean).map((tag) => <span className="pill" key={tag}>{tag}</span>)}</div>
              <p className="row muted"><MapPin size={16} /> {currentUser.city}, {currentUser.country}</p>
            </div>
            <button className="btn btn-primary" onClick={() => setEditing(true)}><Edit3 size={17} /> Edit profile</button>
          </div>
          <p style={{ maxWidth: 720, lineHeight: 1.7 }}>{currentUser.bio}</p>
          <div className="row" style={{ flexWrap: "wrap" }}>{currentUser.skills.map((skill) => <span className="pill" key={skill}>{skill}</span>)}</div>
        </div>
      </div>

      <div className="grid three-col" style={{ marginTop: 18 }}>
        {[
          { label: "Connections", value: "0" },
          { label: "Communities", value: "5" },
          { label: "Posts", value: String(posts.data?.filter((post) => post.user_id === currentUser.id).length ?? 0) },
        ].map(({ label, value }) => (
          <article className="card" style={{ padding: 20 }} key={label}><p className="muted" style={{ margin: 0 }}>{label}</p><strong style={{ fontSize: 30 }}>{value}</strong></article>
        ))}
      </div>

      <div className="grid two-col" style={{ marginTop: 18 }}>
        <article className="card" style={{ padding: 20 }}>
          <div className="row"><MessageCircle color="#1A6B5C" /><strong>Weekly messaging counter</strong></div>
          <p className="muted">Free users can send and receive messages from anyone, including Pro users. Sending is limited to 10 messages per week.</p>
          <div style={{ height: 10, borderRadius: 999, background: "rgba(26,107,92,0.14)", overflow: "hidden", marginTop: 12 }}>
            <div style={{ width: `${Math.min(((weekly.data?.count ?? 0) / 10) * 100, 100)}%`, height: "100%", background: (weekly.data?.count ?? 0) >= 10 ? "#f87171" : "#1A6B5C", borderRadius: 999, transition: "width 300ms ease" }} />
          </div>
          <p>{weekly.data?.count ?? 0} of 10 messages used this week</p>
        </article>
        <article className="card" style={{ padding: 20 }}>
          <div className="row"><Mail color="#1A6B5C" /><strong>Opportunities</strong></div>
          <p>{currentUser.open_to_opportunities ? "Open to relevant roles and collaborations." : "Not currently open to opportunities."}</p>
          {currentUser.open_to_opportunities ? <span className="pill pill--active">Open to Opportunities</span> : <span className="pill">Not open to opportunities</span>}
          <div className="row space-between" style={{ marginTop: 8 }}>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Photo visible</span>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked={currentUser.show_photo} disabled />
              <span className="toggle-slider" />
            </label>
          </div>
        </article>
      </div>

      {editing ? (
        <Modal title="Edit profile" onClose={() => setEditing(false)}>
          <form className="grid" onSubmit={submit}>
            <input className="input" name="full_name" defaultValue={currentUser.full_name} />
            <input className="input" name="industry" defaultValue={currentUser.industry} />
            <textarea className="textarea" name="bio" defaultValue={currentUser.bio} />
            <button className="btn btn-primary" disabled={update.isPending}>Save changes</button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

function ErrorState({ retry }: { retry: () => void }) {
  return <div className="card" style={{ padding: 24 }}><h2>Profile did not load</h2><button className="btn btn-primary" onClick={retry}>Retry</button></div>;
}
