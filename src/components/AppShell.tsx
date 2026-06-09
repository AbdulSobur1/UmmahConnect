"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bell, Briefcase, Compass, Home, MessageCircle, Settings,
  Sparkles, UserRound, ChevronDown, LogOut, Grid3X3, X,
} from "lucide-react";
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

const bottomTabs = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: UserRound },
];

const moreItems = [
  { href: "/mentorship", label: "Mentorship", icon: Sparkles },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
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
                  <span className="row" style={{ gap: 6 }}>
                    <Icon size={16} />
                    {item.label}
                    {item.href === "/notifications" && unreadCount > 0 ? <strong>{unreadCount}</strong> : null}
                  </span>
                </Link>
              );
            })}
          </div>
          {/* Avatar dropdown — desktop */}
          <div className="row desktop-only" ref={dropdownRef} style={{ position: "relative" }}>
            <Link href="/settings" className="pill" style={{ cursor: "pointer", textDecoration: "none" }}>{currentUser?.plan === "free" ? "Free" : currentUser?.plan ?? "..."}</Link>
            <button className="avatar-dropdown-btn" onClick={() => setShowDropdown((v) => !v)} aria-label="User menu">
              <Avatar name={currentUser?.full_name ?? "U"} size={32} />
              <ChevronDown size={14} />
            </button>
            {showDropdown ? (
              <div className="avatar-dropdown-menu">
                <Link href="/settings" className="avatar-dropdown-item" onClick={() => setShowDropdown(false)}>
                  <Settings size={16} /> Settings
                </Link>
                <button className="avatar-dropdown-item" onClick={() => { window.location.href = "/api/auth/logout"; }}>
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="container app-main">{children}</main>

      {/* Mobile bottom tab bar */}
      <nav className="bottom-nav">
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href === "/feed" && pathname === "/");
          return (
            <Link key={tab.href} href={tab.href} className={`bottom-nav-item ${isActive ? "bottom-nav-item--active" : ""}`}>
              <Icon size={22} />
              <span>{tab.label}</span>
              {tab.href === "/messages" ? <span className="bottom-nav-badge" /> : null}
            </Link>
          );
        })}
        <button className={`bottom-nav-item ${showMoreSheet ? "bottom-nav-item--active" : ""}`} onClick={() => setShowMoreSheet(true)}>
          <Grid3X3 size={22} />
          <span>More</span>
        </button>
      </nav>

      {/* More bottom sheet */}
      {showMoreSheet ? (
        <div className="more-sheet-backdrop" onClick={() => setShowMoreSheet(false)}>
          <div className="more-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="more-sheet-header">
              <strong>More</strong>
              <button className="more-sheet-close" onClick={() => setShowMoreSheet(false)}><X size={20} /></button>
            </div>
            <div className="more-sheet-grid">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`more-sheet-item ${isActive ? "more-sheet-item--active" : ""}`} onClick={() => setShowMoreSheet(false)}>
                    <Icon size={22} />
                    <span>{item.label}</span>
                    {item.href === "/notifications" && unreadCount > 0 ? <span className="more-sheet-badge">{unreadCount}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
