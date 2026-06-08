"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signOut } from "next-auth/react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    // Password update via Auth.js will be wired in a future session
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    await signOut({ redirect: false });
    router.push("/login");
  }

  return (
    <main className="page auth-page">
      <form className="card grid auth-card" onSubmit={submit}>
        <Link href="/" className="brand">Ummah <span>Connect</span></Link>
        <h1 className="font-display">Choose a new password</h1>
        <input className="input" name="password" type="password" placeholder="New password" required minLength={8} />
        {error ? <p className="muted">{error}</p> : null}
        <button className="btn btn-primary">Update password</button>
      </form>
    </main>
  );
}
