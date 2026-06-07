"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await response.json() as { data: { authorization_url?: string } | null; error: string | null };
    setLoading(false);
    if (json.error) {
      setError("Signup could not be completed. Please review your details and try again.");
      return;
    }
    if (json.data?.authorization_url) {
      window.location.href = json.data.authorization_url;
      return;
    }
    const next = searchParams.get("next");
    const safeRedirect = next && next.startsWith("/") ? next : "/feed";
    router.push(safeRedirect);
  }

  return (
    <main className="page" style={{ display: "grid", placeItems: "center", padding: 20 }}>
      <form className="card grid" onSubmit={submit} style={{ width: "min(620px, 100%)", padding: 24 }}>
        <Link href="/" className="brand">Ummah Connect</Link>
        <h1 className="font-display" style={{ margin: 0, fontSize: 42 }}>Create account</h1>
        <input className="input" name="full_name" placeholder="Full name" required />
        <input className="input" name="email" type="email" placeholder="Email" required />
        <input className="input" name="password" type="password" placeholder="Password" required minLength={8} />
        <input className="input" name="industry" placeholder="Industry or niche community" required />
        <select className="input" name="career_stage" defaultValue="Early Career">
          {["Student", "Early Career", "Mid-Level", "Senior", "Executive", "Entrepreneur"].map((stage) => <option key={stage}>{stage}</option>)}
        </select>
        <input className="input" name="city" placeholder="City" required />
        <select className="input" name="plan" defaultValue="free">
          <option value="free">Free</option>
          <option value="pro">Pro - ₦9,000/month</option>
        </select>
        {error ? <p className="muted">{error}</p> : null}
        <button className="btn btn-primary" disabled={loading}>{loading ? "Creating..." : "Sign up"}</button>
      </form>
    </main>
  );
}
