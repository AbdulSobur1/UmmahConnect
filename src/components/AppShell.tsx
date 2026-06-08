"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Briefcase, Compass, Home, MessageCircle, Settings, Sparkles, UserRound } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { apiGet } from "@/lib/api/client";
import type { Notification, User } from "@/lib/mock";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/mentorship", label: "Mentorship", icon: Sparkles },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: currentUser } = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const { data: notifications = [] } = useQuery({ queryKey: ["notifications"], queryFn: () => apiGet<Notification[]>("/api/notifications"), enabled: Boolean(currentUser) });
  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  useEffect(() => {
    if (!currentUser) return;
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${currentUser.id}` }, () => {
        void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUser, queryClient]);

  return (
    <div className="app-shell">
      <nav className="app-nav">
        <div className="container app-nav-inner">
          <Link href="/feed" className="brand">
            Ummah <span>Connect</span>
          </Link>
          <div className="nav-links" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (pathname === "/" && item.href === "/feed");
              return (
                <Link key={item.href} href={item.href} className={`nav-link ${active ? "nav-link-active" : ""}`}>
                  <span className="row" style={{ gap: 6 }}>
                    <Icon size={16} />
                    {item.label}
                    {item.href === "/notifications" && unreadCount > 0 ? <strong>{unreadCount}</strong> : null}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="row">
            <span className="pill">{currentUser?.plan === "free" ? "Free" : currentUser?.plan ?? "..."}</span>
            <Avatar name={currentUser?.full_name ?? "Ummah Connect"} size={38} />
          </div>
        </div>
      </nav>
      <main className="container app-main">{children}</main>
    </div>
  );
}
