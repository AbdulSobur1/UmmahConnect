"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, UserPlus } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { apiGet } from "@/lib/api/client";
import type { Community, User } from "@/lib/mock";

export function Discover() {
  const communities = useQuery({ queryKey: ["communities"], queryFn: () => apiGet<Community[]>("/api/communities") });
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/api/users/me") });
  const users = useQuery({ queryKey: ["suggested-users"], queryFn: () => apiGet<User[]>("/api/users/suggestions") });

  if (communities.isLoading) return <div className="skeleton" />;
  if (communities.error) return <ErrorState retry={() => void communities.refetch()} />;

  return (
    <div>
      <div className="screen-title"><div><h1>Discover</h1><p className="muted">Search communities and professionals across Nigeria.</p></div></div>
      <div className="card row" style={{ padding: 14, marginBottom: 18 }}><Search color="#6B7E78" /><input className="input" placeholder="Search by name, industry, city, or community" style={{ border: 0 }} /></div>
      <div className="grid two-col">
        <section>
          <h2 className="font-display" style={{ fontSize: 34 }}>Communities</h2>
          <div className="grid three-col">
            {(communities.data ?? []).map((community) => (
              <article className="card" style={{ padding: 18 }} key={community.id}>
                <div className="row space-between"><span className="pill">{community.icon}</span>{community.is_private ? <small className="muted">Pro</small> : <small className="muted">Open</small>}</div>
                <h3>{community.name}</h3><p className="muted">{community.description}</p><strong>{community.member_count.toLocaleString()} members</strong>
              </article>
            ))}
          </div>
        </section>
        <aside>
          <h2 className="font-display" style={{ fontSize: 34 }}>Suggested connections</h2>
          <div className="grid">
            {(users.data ?? []).filter((user) => user.id !== me.data?.id).slice(0, 5).map((user) => (
              <article className="card row space-between" style={{ padding: 16 }} key={user.id}>
                <div className="row"><Avatar name={user.full_name} /><div><strong>{user.full_name}</strong><p className="muted" style={{ margin: 0 }}>{user.industry} · {user.city}</p></div></div>
                <button className="btn btn-ghost" aria-label={`Connect with ${user.full_name}`}><UserPlus size={17} /></button>
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
