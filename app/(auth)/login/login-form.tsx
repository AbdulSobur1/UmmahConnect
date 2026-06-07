'use client';

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    const json = await response.json() as { error: string | null };
    setLoading(false);
    if (json.error) {
      setError("We could not sign you in. Please check your details and try again.");
      return;
    }
    const next = searchParams.get("next");
    const safeRedirect = next && next.startsWith("/") ? next : "/feed";
    router.push(safeRedirect);
  }

  return (
    <form className="card grid" onSubmit={submit} style={{ width: "min(460px, 100%)", padding: 24 }}>
      <Link href="/" className="brand">Ummah Connect</Link>
      <h1 className="font-display" style={{ margin: 0, fontSize: 42 }}>Log in</h1>
      <input className="input" name="email" type="email" placeholder="Email" required />
      <input className="input" name="password" type="password" placeholder="Password" required />
      {error ? <p className="muted">{error}</p> : null}
      <button className="btn btn-primary" disabled={loading}>{loading ? "Signing in..." : "Enter app"}</button>
      <p className="muted">New here? <Link href="/signup">Create an account</Link> · <Link href="/reset-password">Reset password</Link></p>
    </form>
  );
}
