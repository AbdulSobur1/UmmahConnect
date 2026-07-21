"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { PageTransition } from "@/components/ui/PageTransition";
import { apiGet, apiSend } from "@/lib/api/client";
import { formatMessageTime } from "@/lib/utils/time";
import type { Message, User } from "@/types";

export function Messages() {
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const users = useQuery({ queryKey: ["suggested-users"], queryFn: () => apiGet<User[]>("/api/users/suggestions") });
  const [activeUserId, setActiveUserId] = useState<string>("");
  const weekly = useQuery({ queryKey: ["weekly-count"], queryFn: () => apiGet<{ count: number; remaining: number }>("/api/messages/weekly-count") });
  const thread = useQuery({
    queryKey: ["messages", activeUserId],
    queryFn: () => apiGet<Message[]>(`/api/messages/${activeUserId}`),
    enabled: Boolean(activeUserId),
  });
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
    <PageTransition>
      <div className="screen-title" style={{ marginBottom: 16 }}>
        <div>
          <h1>Messages</h1>
          <p className="muted">Private conversations</p>
        </div>
        <span className="pill">{weekly.data?.count ?? 0} of 10 used</span>
      </div>
      {send.error ? (
        <div className="card" style={{ padding: 12, marginBottom: 12 }}>
          <strong style={{ fontSize: 14 }}>Message not sent.</strong>
          <p className="muted" style={{ fontSize: 13, margin: "4px 0 0" }}>Weekly limits or network issues may be blocking this send.</p>
        </div>
      ) : null}
      <div className="grid two-col" style={{ gap: 14 }}>
        {/* Conversation list */}
        <aside className="card" style={{ padding: 0, overflow: "hidden" }}>
          {(users.data ?? []).map((user) => {
            const isActive = user.id === activeUserId;
            const hasUnread = false; // Simplified - would come from actual data
            return (
              <button
                key={user.id}
                onClick={() => setActiveUserId(user.id)}
                style={{
                  width: "100%",
                  border: 0,
                  borderRadius: 0,
                  background: isActive ? "rgba(26,107,92,0.12)" : "transparent",
                  padding: "12px 14px",
                  color: "#fff",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderBottom: "1px solid var(--line)",
                  position: "relative",
                  minHeight: 44,
                }}
              >
                <div style={{ position: "relative" }}>
                  <Avatar name={user.full_name} size={40} />
                  {hasUnread && (
                    <span style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--color-primary)",
                      border: "2px solid var(--color-bg-secondary)",
                    }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.full_name}
                    </strong>
                    <span style={{ fontSize: 11, color: "var(--color-muted-light)", flexShrink: 0, marginLeft: 4 }}>
                      2h
                    </span>
                  </div>
                  <p style={{
                    margin: "2px 0 0",
                    fontSize: 13,
                    color: "var(--color-muted-light)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {user.industry}
                  </p>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Active conversation thread */}
        <section className="card" style={{
          padding: 16,
          minHeight: 560,
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid var(--line)",
            paddingBottom: 12,
          }}>
            <Avatar name={active?.full_name ?? "User"} size={36} />
            <div>
              <strong style={{ fontSize: 15 }}>{active?.full_name ?? "Select a conversation"}</strong>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                {active?.industry} · {active?.city}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "16px 0",
            gap: 8,
          }}>
            {(thread.data ?? []).length === 0 ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <p className="muted" style={{ fontSize: 14 }}>No messages yet. Start the conversation.</p>
              </div>
            ) : (
              (thread.data ?? []).map((message) => {
                const mine = message.sender_id === me.data?.id;
                return (
                  <div
                    key={message.id}
                    style={{
                      display: "flex",
                      justifyContent: mine ? "flex-end" : "flex-start",
                      flexDirection: "column",
                      alignItems: mine ? "flex-end" : "flex-start",
                      maxWidth: "75%",
                      alignSelf: mine ? "flex-end" : "flex-start",
                    }}
                  >
                    <div style={{
                      borderRadius: 12,
                      padding: "8px 14px",
                      background: mine ? "#1A6B5C" : "rgba(255,255,255,0.06)",
                      color: mine ? "#FAF7F2" : "#fff",
                      fontSize: 14,
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                    }}>
                      {message.content}
                    </div>
                    <span style={{
                      fontSize: 11,
                      color: "var(--color-muted-light)",
                      marginTop: 3,
                      padding: "0 4px",
                    }}>
                      {formatMessageTime(message.created_at)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={submit}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderTop: "1px solid var(--line)",
              paddingTop: 12,
            }}
          >
            <input
              className="input"
              name="content"
              placeholder="Write a message..."
              style={{ flex: 1, minHeight: 44 }}
            />
            <button
              type="submit"
              disabled={send.isPending || !activeUserId}
              aria-label="Send message"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: 0,
                background: "var(--color-primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 160ms ease",
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#155a4d"}
              onMouseOut={(e) => e.currentTarget.style.background = "var(--color-primary)"}
            >
              <Send size={20} />
            </button>
          </form>
        </section>
      </div>
    </PageTransition>
  );
}
