"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [dropdownAnimating, setDropdownAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: currentUser } = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiGet<Notification[]>("/api/notifications"),
    enabled: Boolean(currentUser),
  });
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

  // Animate dropdown
  const toggleDropdown = useCallback(() => {
    if (!showDropdown) {
      setDropdownAnimating(true);
      setShowDropdown(true);
    } else {
      setDropdownAnimating(false);
      setTimeout(() => setShowDropdown(false), 150);
    }
  }, [showDropdown]);

  return (
    <div className="app-shell">
      {/* Bismillah header */}
      <div className="app-header-bismillah">
        <span lang="ar" dir="rtl">بسم الله الرحمن الرحيم</span>
      </div>

      {/* Desktop top nav */}
      <nav className="app-nav app-nav--desktop" style={{ position: "sticky", top: 0, zIndex: 20 }}>
        <div className="container app-nav-inner">
          <Link href="/feed" className="brand transition-fast" style={{ opacity: 1 }}>
            Ummah <span>Connect</span>
          </Link>
          <div className="nav-links" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${active ? "nav-link-active" : ""} transition-fast`}
                >
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
              className="transition-fast hover-lift"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 999,
                padding: "8px 12px",
                color: "var(--color-success)",
                background: "var(--color-success-light)",
                border: "1px solid rgba(94,205,181,0.16)",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {currentUser?.plan === "free" ? "Free" : currentUser?.plan ?? "..."}
            </Link>
            <button
              className="transition-fast"
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
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              onClick={toggleDropdown}
              aria-label="User menu"
            >
              <Avatar name={currentUser?.full_name ?? "U"} size={32} />
              <ChevronDown
                size={14}
                style={{ transition: "transform 0.2s ease", transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            {showDropdown ? (
              <div
                className={dropdownAnimating ? "animate-scale-in" : ""}
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "var(--color-bg-secondary)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: 6,
                  minWidth: 200,
                  zIndex: 30,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                  transformOrigin: "top right",
                }}
              >
                <Link
                  href="/settings"
                  className="transition-fast"
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
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  onClick={() => setShowDropdown(false)}
                >
                  <Settings size={16} /> Settings
                </Link>
                <button
                  className="transition-fast"
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
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
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
          className="animate-notification-slide"
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
          <Bell size={16} style={{ flex: "0 0 auto", color: "var(--color-accent)" }} />
          <span style={{ flex: 1, lineHeight: 1.4 }}>{latestNotification.content}</span>
          <button
            className="transition-fast"
            style={{
              flex: "0 0 auto",
              background: "transparent",
              border: 0,
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              padding: 4,
              borderRadius: 6,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
            onClick={() => setDismissedNotif(latestNotification.id)}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      {/* Main content */}
      <main className="container app-main animate-fade-in">{children}</main>

      {/* Mobile bottom tab bar — exactly 5 tabs */}
      <nav className="bottom-nav">
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href === "/feed" && pathname === "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="transition-fast"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                padding: "6px 8px 4px",
                borderRadius: 8,
                color: isActive ? "var(--color-primary)" : "rgba(255,255,255,0.5)",
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
                transition: "color 0.15s ease",
              }}
            >
              <Icon
                size={22}
                style={{ transition: "transform 0.15s ease" }}
                className={isActive ? "" : ""}
              />
              <span>{tab.label}</span>
              {isActive ? (
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 20,
                    height: 3,
                    borderRadius: "0 0 3px 3px",
                    background: "var(--color-primary)",
                  }}
                />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
