"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Briefcase, Compass, Home, MessageCircle, Settings, Sparkles, UserRound, ChevronDown, LogOut } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { apiGet } from "@/lib/api/client";
import type { Notification, User } from "@/lib/mock";
const navItems = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/mentorship", label: "Mentorship", icon: Sparkles },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/notifications", label: "Alerts", icon: Bell },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: currentUser } = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const { data: notifications = [] } = useQuery({ queryKey: ["notifications"], queryFn: () => apiGet<Notification[]>("/api/notifications"), enabled: Boolean(currentUser) });
  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <div className="row" ref={dropdownRef} style={{ position: "relative" }}>
            <Link href="/settings" className="pill" style={{ cursor: "pointer", textDecoration: "none" }}>{currentUser?.plan === "free" ? "Free" : currentUser?.plan ?? "..."}</Link>
            <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6, border: 0, padding: "2px 6px", borderRadius: 8 }} onClick={() => setShowDropdown((v) => !v)}>
              <Avatar name={currentUser?.full_name ?? "Ummah Connect"} size={34} />
              <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.45)" }} />
            </button>
            {showDropdown ? (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, background: "#132420", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 6, minWidth: 180, zIndex: 30, boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}>
                <Link href="/settings" className="row" style={{ padding: "10px 12px", borderRadius: 8, color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 600, textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"} onClick={() => setShowDropdown(false)}>
                  <Settings size={16} /> Settings
                </Link>
                <button className="row" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, background: "transparent", border: 0, cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"} onClick={() => { window.location.href = "/api/auth/logout"; }}>
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </nav>
      <main className="container app-main">{children}</main>
    </div>
  );
}
