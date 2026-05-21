"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { useEffect } from "react";
import { apiGet, apiSend } from "@/lib/api/client";
import type { Notification, User } from "@/lib/mock";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function Notifications() {
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const notifications = useQuery({ queryKey: ["notifications"], queryFn: () => apiGet<Notification[]>("/api/notifications") });
  const markAll = useMutation({ mutationFn: () => apiSend("/api/notifications/read", "PATCH"), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notifications"] }) });
  const markOne = useMutation({ mutationFn: (id: string) => apiSend(`/api/notifications/${id}/read`, "PATCH"), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notifications"] }) });

  useEffect(() => {
    if (!me.data) return;
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel("notifications").on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${me.data.id}` }, () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }).subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [me.data, queryClient]);

  if (notifications.isLoading) return <div className="skeleton" />;
  if (notifications.error) return <div className="card" style={{ padding: 24 }}><h2>Notifications did not load</h2><button className="btn btn-primary" onClick={() => void notifications.refetch()}>Retry</button></div>;

  return (
    <div>
      <div className="screen-title"><div><h1>Notifications</h1><p className="muted">Connection, message, mentorship, job, and sponsored event updates.</p></div><button className="btn btn-primary" onClick={() => markAll.mutate()}><CheckCheck size={17} /> Mark all as read</button></div>
      <div className="grid">
        {(notifications.data ?? []).map((notification) => (
          <article className="card row space-between" style={{ padding: 18, borderColor: notification.is_read ? "var(--line)" : "#C9A84C" }} key={notification.id}>
            <div className="row"><Bell color={notification.is_read ? "#6B7E78" : "#1A6B5C"} /><div><strong>{notification.content}</strong><p className="muted" style={{ margin: 0 }}>{notification.type} · {notification.created_at}</p></div></div>
            <div className="row">{!notification.is_read ? <span className="pill">Unread</span> : null}{notification.type === "connection" ? <button className="btn btn-accent">Accept</button> : null}<button className="btn btn-ghost" onClick={() => markOne.mutate(notification.id)}>Read</button></div>
          </article>
        ))}
      </div>
    </div>
  );
}
