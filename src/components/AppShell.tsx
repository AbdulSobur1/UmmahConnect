"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase, Compass, Home, MessageCircle, Settings,
  Sparkles, UserRound, ChevronDown, LogOut, Bell, X,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { apiGet } from "@/lib/api/client";
import type { Notification, User } from "@/types";

const navItems = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/mentorship", label: "Mentorship", icon: Sparkles },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/messages", label: "Messages", icon: MessageCircle },
];

const bottomTabs = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [dismissedNotif, setDismissedNotif] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: currentUser } = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiGet<Notification[]>("/api/notifications"),
    enabled: Boolean(currentUser),
  });
  const unreadCount = notifications.filter((notification) => !notification.is_read).length;
  const latestNotification = notifications.find((n) => !n.is_read);

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
      {/* Desktop top nav */}
      <nav className="app-nav app-nav--desktop">
        <div className="container app-nav-inner">
          <Link href="/feed" className="brand">
            Ummah <span>Connect</span>
          </Link>
          <div className="nav-links" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`nav-link ${active ? "nav-link-active" : ""}`}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon size={16} />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
          {/* Avatar dropdown — desktop */}
          <div
            className="desktop-only"
            ref={dropdownRef}
            style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}
          >
            <Link
              href="/settings"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 999,
                padding: "8px 12px",
                color: "#5ECDB5",
                background: "rgba(94,205,181,0.1)",
                border: "1px solid rgba(94,205,181,0.16)",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {currentUser?.plan === "free" ? "Free" : currentUser?.plan ?? "..."}
            </Link>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: 0,
                padding: "2px 6px",
                borderRadius: 8,
                background: "transparent",
                color: "rgba(255,255,255,0.45)",
                cursor: "pointer",
              }}
              onClick={() => setShowDropdown((v) => !v)}
              aria-label="User menu"
            >
              <Avatar name={currentUser?.full_name ?? "U"} size={32} />
              <ChevronDown size={14} />
            </button>
            {showDropdown ? (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "#132420",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: 6,
                  minWidth: 180,
                  zIndex: 30,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                }}
              >
                <Link
                  href="/settings"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowDropdown(false)}
                >
                  <Settings size={16} /> Settings
                </Link>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() => { window.location.href = "/api/auth/logout"; }}
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Notification banner at top of page */}
      {latestNotification && dismissedNotif !== latestNotification.id ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 18px",
            background: "rgba(26,107,92,0.92)",
            borderBottom: "1px solid rgba(201,168,76,0.2)",
            fontSize: 13,
            fontWeight: 500,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          <Bell size={16} style={{ flex: "0 0 auto", color: "#C9A84C" }} />
          <span style={{ flex: 1, lineHeight: 1.4 }}>{latestNotification.content}</span>
          <button
            style={{
              flex: "0 0 auto",
              background: "transparent",
              border: 0,
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              padding: 4,
              borderRadius: 6,
            }}
            onClick={() => setDismissedNotif(latestNotification.id)}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      {/* Main content */}
      <main className="container app-main">{children}</main>

      {/* Mobile bottom tab bar — exactly 5 tabs */}
      <nav className="bottom-nav">
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href === "/feed" && pathname === "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                padding: "6px 8px 4px",
                borderRadius: 8,
                color: isActive ? "#1A6B5C" : "rgba(255,255,255,0.5)",
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                textDecoration: "none",
                minWidth: 48,
                minHeight: 48,
                border: 0,
                background: "transparent",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <Icon size={22} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
