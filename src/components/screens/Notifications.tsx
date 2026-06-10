"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { useEffect } from "react";
import { apiGet, apiSend } from "@/lib/api/client";
import { formatPostTime } from "@/lib/utils/time";
import type { Notification, User } from "@/types";
export function Notifications() {
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const notifications = useQuery({ queryKey: ["notifications"], queryFn: () => apiGet<Notification[]>("/api/notifications") });
  const markAll = useMutation({ mutationFn: () => apiSend("/api/notifications/read", "PATCH"), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notifications"] }) });
  const markOne = useMutation({ mutationFn: (id: string) => apiSend(`/api/notifications/${id}/read`, "PATCH"), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notifications"] }) });
  const acceptConnection = useMutation({
    mutationFn: (input: { connectionId: string; notificationId: string }) => apiSend(`/api/connections/${input.connectionId}`, "PATCH", { status: "accepted" }),
    onSuccess: (_, input) => {
      void markOne.mutate(input.notificationId);
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  if (notifications.isLoading) return <div className="skeleton" />;
  if (notifications.error) return <div className="card" style={{ padding: 24 }}><h2>Notifications did not load</h2><button className="btn btn-primary" onClick={() => void notifications.refetch()}>Retry</button></div>;

  return (
    <div>
      <div className="screen-title"><div><h1>Notifications</h1><p className="muted">Connection, message, mentorship, job, and sponsored event updates.</p></div><button className="btn btn-primary" onClick={() => markAll.mutate()}><CheckCheck size={17} /> Mark all as read</button></div>
      {acceptConnection.error ? <div className="card" style={{ padding: 14, marginBottom: 14 }}><strong>Connection was not accepted.</strong><p className="muted">This notification may point to an older request.</p></div> : null}
      <div className="grid">
        {(notifications.data ?? []).map((notification) => (
          <article className="card row space-between" style={{ padding: 18, borderColor: notification.is_read ? "var(--line)" : "#C9A84C" }} key={notification.id}>
            <div className="row"><Bell color={notification.is_read ? "#6B7E78" : "#1A6B5C"} /><div><strong>{notification.content}</strong><p className="muted" style={{ margin: 0 }}>{notification.type} · {formatPostTime(notification.created_at)}</p></div></div>
            <div className="row">{!notification.is_read ? <span className="pill">Unread</span> : null}{notification.type === "connection" && notification.reference_id ? <button className="btn btn-accent" disabled={acceptConnection.isPending} onClick={() => acceptConnection.mutate({ connectionId: notification.reference_id!, notificationId: notification.id })}>Accept</button> : null}<button className="btn btn-ghost" onClick={() => markOne.mutate(notification.id)}>Read</button></div>
          </article>
        ))}
      </div>
    </div>
  );
}
