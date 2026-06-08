"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Bell, Crown, Eye, KeyRound, Lock, Shield } from "lucide-react";
import { FormEvent, useState } from "react";
import { Modal } from "@/components/Modal";
import { apiGet, apiSend } from "@/lib/api/client";
import type { User } from "@/lib/mock";

const tabs = ["Account", "Privacy", "Plan", "Notifications"];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Account");
  const [showPlan, setShowPlan] = useState(false);
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const update = useMutation({
    mutationFn: (body: Partial<User>) => apiSend<User>(`/api/users/${me.data?.id}`, "PATCH", body),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["me"] }),
  });

  if (me.isLoading) return <div className="skeleton" />;
  if (!me.data) return <div className="card" style={{ padding: 24 }}>Settings did not load.</div>;
  const currentUser = me.data;

  function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    update.mutate({ full_name: String(form.get("full_name") ?? ""), email: String(form.get("email") ?? ""), city: String(form.get("city") ?? "") });
  }

  return (
    <div>
      <div className="screen-title"><div><h1>Settings</h1><p className="muted">Control profile visibility, account details, plan access, and alerts.</p></div></div>
      <div className="row" style={{ flexWrap: "wrap", marginBottom: 18 }}>{tabs.map((tab) => <button key={tab} className={`btn ${activeTab === tab ? "btn-primary" : "btn-ghost"}`} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>
      <section className="card" style={{ padding: 22 }}>
        {activeTab === "Account" ? (
          <form className="grid" onSubmit={saveAccount}>
            <div className="row"><Shield color="#1A6B5C" /><strong>Account profile</strong></div>
            <input className="input" name="full_name" defaultValue={currentUser.full_name} />
            <input className="input" name="email" defaultValue={currentUser.email} />
            <input className="input" name="city" defaultValue={currentUser.city} />
            <div className="row row--wrap">
              <button className="btn btn-primary">Save account</button>
              <Link className="btn btn-ghost" href="/reset-password"><KeyRound size={17} /> Change password</Link>
            </div>
          </form>
        ) : null}
        {activeTab === "Privacy" ? (
          <div className="grid">
            <div className="row"><Lock color="#1A6B5C" /><strong>Privacy controls</strong></div>
            <label className="row space-between"><span className="row"><Eye size={18} /> Show profile photo</span><input type="checkbox" defaultChecked={currentUser.show_photo} onChange={(event) => update.mutate({ show_photo: event.currentTarget.checked })} /></label>
            <label className="row space-between"><span>Open to opportunities</span><input type="checkbox" defaultChecked={currentUser.open_to_opportunities} onChange={(event) => update.mutate({ open_to_opportunities: event.currentTarget.checked })} /></label>
            <label className="row space-between"><span>Allow connection requests</span><input type="checkbox" defaultChecked /></label>
          </div>
        ) : null}
        {activeTab === "Plan" ? (
          <div className="grid"><div className="row"><Crown color="#C9A84C" /><strong>Current plan: {currentUser.plan}</strong></div><p className="muted">Free includes 10 messages per week. Pro unlocks unlimited messaging, full mentorship, private groups, profile analytics, and job posting.</p><button className="btn btn-accent" style={{ justifySelf: "start" }} onClick={() => setShowPlan(true)}>Compare plans</button></div>
        ) : null}
        {activeTab === "Notifications" ? (
          <div className="grid"><div className="row"><Bell color="#1A6B5C" /><strong>Notification preferences</strong></div>{["Connection requests", "New messages", "Mentorship updates", "Matching jobs", "Sponsored events"].map((label) => <label className="row space-between" key={label}><span>{label}</span><input type="checkbox" defaultChecked /></label>)}</div>
        ) : null}
      </section>
      {showPlan ? (
        <Modal title="Plan comparison" onClose={() => setShowPlan(false)}>
          <div className="grid three-col">
            <article className="card" style={{ padding: 16, boxShadow: "none" }}><h3>Free</h3><strong>₦0/month</strong><p className="muted">Professional profile, public communities, 30 connections, 10 messages per week, browse jobs and mentorship.</p></article>
            <article className="card" style={{ padding: 16, boxShadow: "none" }}><h3>Pro</h3><strong>₦9,000/month</strong><p className="muted">Unlimited connections and messaging, job posting, full mentorship matching, halal job alerts, analytics, private groups.</p></article>
            <article className="card" style={{ padding: 16, boxShadow: "none" }}><h3>Event Sponsor</h3><strong>From ₦49,000/event</strong><p className="muted">For organisations only: featured events, sponsored slots, targeting, analytics, and Verified Organiser badge.</p></article>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
