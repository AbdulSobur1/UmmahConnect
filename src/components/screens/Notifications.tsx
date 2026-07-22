"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Users, MessageCircle, Briefcase, Sparkles, CreditCard, BellOff } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageTransition, Stagger } from "@/components/ui/PageTransition";
import { apiGet, apiSend } from "@/lib/api/client";
import { formatPostTime } from "@/lib/utils/time";
import type { Notification, User } from "@/types";

const iconByType: Record<string, typeof Bell> = {
  connection: Users,
  message: MessageCircle,
  job: Briefcase,
  mentor: Sparkles,
  mentorship: Sparkles,
  payment: CreditCard,
};

function groupNotifications(items: Notification[]) {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();
  
  const groups: { label: string; items: Notification[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "This Week", items: [] },
    { label: "Earlier", items: [] },
  ];

  for (const item of items) {
    const dateStr = new Date(item.created_at).toDateString();
    if (dateStr === today) groups[0].items.push(item);
    else if (dateStr === yesterday) groups[1].items.push(item);
    else if (Date.now() - new Date(item.created_at).getTime() < 7 * 86400000) groups[2].items.push(item);
    else groups[3].items.push(item);
  }

  return groups.filter((g) => g.items.length > 0);
}

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

  const grouped = useMemo(() => groupNotifications(notifications.data ?? []), [notifications.data]);

  if (notifications.isLoading) return <div className="skeleton" />;
  if (notifications.error) return (
    <Card padding="lg">
      <strong>Notifications did not load</strong>
      <Button variant="primary" style={{ marginTop: 12 }} onClick={() => void notifications.refetch()}>Retry</Button>
    </Card>
  );

  return (
    <PageTransition>
      <div className="screen-title">
        <div><h1>Notifications</h1><p className="muted">Connection, message, mentorship, job, and sponsored event updates.</p></div>
        <Button variant="primary" icon={<CheckCheck size={17} />} onClick={() => markAll.mutate()}>Mark all as read</Button>
      </div>
      {acceptConnection.error ? (
        <Card padding="sm" style={{ marginBottom: 14 }}>
          <strong>Connection was not accepted.</strong>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>This notification may point to an older request.</p>
        </Card>
      ) : null}
      
      {grouped.length === 0 ? (
        <EmptyState
          icon={<BellOff size={28} />}
          title="All caught up!"
          description="No notifications yet. We'll let you know when something new arrives."
        />
      ) : (
        grouped.map((group) => (
          <div key={group.label} style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-muted)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {group.label}
            </h3>
            <Stagger as="div" className="grid" style={{ gap: 8 }}>
              {group.items.map((notification) => {
                const IconComponent = iconByType[notification.type] || Bell;
                return (
                  <Card
                    key={notification.id}
                    padding="md"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      borderColor: notification.is_read ? "var(--color-line)" : "var(--color-accent)",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--radius-full)",
                        background: notification.is_read ? "var(--color-bg-hover)" : "var(--color-primary-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: notification.is_read ? "var(--color-text-muted)" : "var(--color-primary)",
                      }}
                    >
                      <IconComponent size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: 14, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {notification.content}
                      </strong>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>
                        {notification.type} · {formatPostTime(notification.created_at)}
                      </p>
                    </div>
                    <div className="row" style={{ gap: 6, flexShrink: 0 }}>
                      {!notification.is_read && (
                        <span className="pill" style={{ fontSize: 10, padding: "2px 8px" }}>New</span>
                      )}
                      {notification.type === "connection" && notification.reference_id ? (
                        <Button
                          variant="accent"
                          size="sm"
                          disabled={acceptConnection.isPending}
                          onClick={() => acceptConnection.mutate({ connectionId: notification.reference_id!, notificationId: notification.id })}
                        >
                          Accept
                        </Button>
                      ) : null}
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markOne.mutate(notification.id)}
                        >
                          Read
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </Stagger>
          </div>
        ))
      )}
    </PageTransition>
  );
}
