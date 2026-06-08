"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { apiGet, apiSend } from "@/lib/api/client";
import type { Message, User } from "@/lib/mock";
export function Messages() {
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const users = useQuery({ queryKey: ["suggested-users"], queryFn: () => apiGet<User[]>("/api/users/suggestions") });
  const [activeUserId, setActiveUserId] = useState<string>("");
  const weekly = useQuery({ queryKey: ["weekly-count"], queryFn: () => apiGet<{ count: number; remaining: number }>("/api/messages/weekly-count") });
  const thread = useQuery({ queryKey: ["messages", activeUserId], queryFn: () => apiGet<Message[]>(`/api/messages/${activeUserId}`), enabled: Boolean(activeUserId) });
  const send = useMutation({
    mutationFn: (content: string) => apiSend<{ message: Message; weekly_count: number }>(`/api/messages/${activeUserId}`, "POST", { content }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["messages", activeUserId] });
      void queryClient.invalidateQueries({ queryKey: ["weekly-count"] });
    },
  });

  useEffect(() => {
    if (!activeUserId && users.data?.[0]) setActiveUserId(users.data[0].id);
  }, [activeUserId, users.data]);

  const active = useMemo(() => users.data?.find((user) => user.id === activeUserId), [activeUserId, users.data]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = String(new FormData(event.currentTarget).get("content") ?? "");
    if (content.trim()) send.mutate(content);
    event.currentTarget.reset();
  }

  if (users.isLoading) return <div className="skeleton" />;

  return (
    <div>
      <div className="screen-title"><div><h1>Messages</h1><p className="muted">Private conversations with weekly limits for free accounts.</p></div><span className="pill">{weekly.data?.count ?? 0} of 10 messages used this week</span></div>
      {send.error ? <div className="card" style={{ padding: 14, marginBottom: 14 }}><strong>Message not sent.</strong><p className="muted">Free weekly limits or network issues may be blocking this send.</p></div> : null}
      <div className="grid two-col">
        <aside className="card" style={{ padding: 12 }}>
          {(users.data ?? []).map((user) => (
            <button key={user.id} className="row space-between" onClick={() => setActiveUserId(user.id)} style={{ width: "100%", border: 0, borderRadius: 8, background: user.id === activeUserId ? "rgba(26,107,92,0.1)" : "transparent", padding: 12, color: "#0D1B1E", textAlign: "left" }}>
              <span className="row"><Avatar name={user.full_name} /><span><strong>{user.full_name}</strong><small className="muted" style={{ display: "block" }}>{user.industry}</small></span></span>
            </button>
          ))}
        </aside>
        <section className="card" style={{ padding: 18, minHeight: 560, display: "flex", flexDirection: "column" }}>
          <div className="row" style={{ borderBottom: "1px solid var(--line)", paddingBottom: 14 }}><Avatar name={active?.full_name ?? "User"} /><div><strong>{active?.full_name ?? "Select a conversation"}</strong><p className="muted" style={{ margin: 0 }}>{active?.industry} · {active?.city}</p></div></div>
          <div className="grid" style={{ flex: 1, alignContent: "end", padding: "18px 0" }}>
            {(thread.data ?? []).map((message) => {
              const mine = message.sender_id === me.data?.id;
              return <div key={message.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}><div style={{ maxWidth: 420, borderRadius: 8, padding: 12, background: mine ? "#1A6B5C" : "#FAF7F2", color: mine ? "#FAF7F2" : "#0D1B1E" }}>{message.content}<small style={{ display: "block", marginTop: 6, opacity: 0.7 }}>{message.created_at}</small></div></div>;
            })}
          </div>
          <form className="row" onSubmit={submit}><input className="input" name="content" placeholder="Write a message..." /><button className="btn btn-primary" disabled={send.isPending || !activeUserId}><Send size={17} /> Send</button></form>
        </section>
      </div>
    </div>
  );
}
