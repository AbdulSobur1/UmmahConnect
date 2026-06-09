"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, UserPlus, MessageSquare, Globe } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { apiGet, apiSend } from "@/lib/api/client";
import type { Community, User } from "@/lib/mock";

export function Discover() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const communities = useQuery({ queryKey: ["communities"], queryFn: () => apiGet<Community[]>("/api/communities") });
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const users = useQuery({ queryKey: ["suggested-users"], queryFn: () => apiGet<User[]>("/api/users/suggestions") });
  const connect = useMutation({
    mutationFn: (receiver_id: string) => apiSend("/api/connections", "POST", { receiver_id }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  const normalizedSearch = search.trim().toLowerCase();
  const filteredCommunities = useMemo(() => {
    const list = communities.data ?? [];
    if (!normalizedSearch) return list;
    return list.filter((community) =>
      [community.name, community.description].some((value) => value.toLowerCase().includes(normalizedSearch)),
    );
  }, [communities.data, normalizedSearch]);
  const filteredUsers = useMemo(() => {
    const list = (users.data ?? []).filter((user) => user.id !== me.data?.id && user.industry && user.industry !== "Other" && user.industry !== "");
    if (!normalizedSearch) return list;
    return list.filter((user) =>
      [user.full_name, user.industry, user.city, user.country, user.career_stage].some((value) => value.toLowerCase().includes(normalizedSearch)),
    );
  }, [me.data?.id, normalizedSearch, users.data]);

  if (communities.isLoading) return <div className="skeleton" />;
  if (communities.error) return <ErrorState retry={() => void communities.refetch()} />;

  return (
    <div>
      <div className="screen-title"><div><h1>Discover</h1><p className="muted">Search communities and professionals across Nigeria.</p></div></div>
      <div className="card" style={{ padding: 14, marginBottom: 18 }}>
        <div className="row"><Search color="#6B7E78" /><input className="input" placeholder="Search by name, industry, city, or community" style={{ border: 0 }} value={search} onChange={(event) => setSearch(event.currentTarget.value)} /></div>
        <div className="row row--wrap" style={{ marginTop: 10 }}>
          {["Tech", "Finance", "Healthcare", "Creative"].map((filter) => (
            <button key={filter} className={`btn btn-ghost`} style={{ fontSize: 13, padding: "4px 14px", minHeight: 32 }} onClick={() => setSearch(filter)}>{filter}</button>
          ))}
        </div>
      </div>
      <div className="grid two-col">
        <section>
          <h2 className="font-display" style={{ fontSize: 34 }}>Communities</h2>
          <div className="grid three-col">
            {filteredCommunities.length > 0 ? filteredCommunities.map((community) => (
              <article className="card" style={{ padding: 18 }} key={community.id}>
                <div className="row space-between"><span className="pill">{community.icon}</span>{community.is_private ? <small className="muted">Pro</small> : <small className="muted">Open</small>}</div>
                <h3>{community.name}</h3><p className="muted">{community.description}</p><strong>{community.member_count.toLocaleString()} members</strong>
              </article>
            )) : (
              <div className="card" style={{ padding: 28, textAlign: "center", gridColumn: "1 / -1" }}>
                <Globe size={36} color="#6B7E78" style={{ marginBottom: 12 }} />
                <strong>Communities coming soon</strong>
                <p className="muted" style={{ margin: "6px 0 0" }}>Check back shortly — new communities are being added regularly.</p>
              </div>
            )}
          </div>
        </section>
        <aside>
          <h2 className="font-display" style={{ fontSize: 34 }}>Suggested connections</h2>
          {connect.error ? <p className="muted">Connection request could not be sent.</p> : null}
          <div className="grid">
            {filteredUsers.slice(0, 5).map((user) => (
              <article className="card row space-between" style={{ padding: 16 }} key={user.id}>
                <div className="row"><Avatar name={user.full_name} /><div><strong>{user.full_name}</strong><p className="muted" style={{ margin: 0 }}>{user.industry} · {user.city}</p></div></div>
                <button className="btn btn-ghost" aria-label={`Connect with ${user.full_name}`} disabled={connect.isPending} onClick={() => connect.mutate(user.id)}><UserPlus size={17} /></button>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ErrorState({ retry }: { retry: () => void }) {
  return <div className="card" style={{ padding: 24 }}><h2>Discover did not load</h2><button className="btn btn-primary" onClick={retry}>Retry</button></div>;
}
