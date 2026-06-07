"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError("Password could not be updated. Please request a new reset link.");
      return;
    }
    router.push("/feed");
  }

  return (
    <main className="page auth-page">
      <form className="card grid auth-card" onSubmit={submit}>
        <Link href="/" className="brand">Ummah Connect</Link>
        <h1 className="font-display">Choose a new password</h1>
        <input className="input" name="password" type="password" placeholder="New password" required minLength={8} />
        {error ? <p className="muted">{error}</p> : null}
        <button className="btn btn-primary">Update password</button>
      </form>
    </main>
  );
}
