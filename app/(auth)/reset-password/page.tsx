"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ResetPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    setMessage("If that email exists, Supabase will send a reset link shortly.");
  }

  return (
    <main className="page" style={{ display: "grid", placeItems: "center", padding: 20 }}>
      <form className="card grid" onSubmit={submit} style={{ width: "min(460px, 100%)", padding: 24 }}>
        <Link href="/" className="brand">Ummah Connect</Link>
        <h1 className="font-display" style={{ margin: 0, fontSize: 42 }}>Reset password</h1>
        <input className="input" name="email" type="email" placeholder="Email" required />
        {message ? <p className="muted">{message}</p> : null}
        <button className="btn btn-primary">Send reset link</button>
      </form>
    </main>
  );
}
