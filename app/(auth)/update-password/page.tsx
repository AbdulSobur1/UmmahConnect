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
    <main className="page" style={{ display: "grid", placeItems: "center", padding: 20 }}>
      <form className="card grid" onSubmit={submit} style={{ width: "min(460px, 100%)", padding: 24 }}>
        <Link href="/" className="brand">Ummah Connect</Link>
        <h1 className="font-display" style={{ margin: 0, fontSize: 42 }}>Choose a new password</h1>
        <input className="input" name="password" type="password" placeholder="New password" required minLength={8} />
        {error ? <p className="muted">{error}</p> : null}
        <button className="btn btn-primary">Update password</button>
      </form>
    </main>
  );
}
