'use client';

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

type LoginResponse = {
  error: string | null;
  message?: string;
};

function safeInternalPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/feed";
  return value;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFormError(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const nextErrors: Record<string, string> = {};
    if (!email) nextErrors.email = "Email is required.";
    if (!password) nextErrors.password = "Password is required.";
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await response.json() as LoginResponse;
    setLoading(false);

    if (!response.ok || json.error) {
      setFormError(json.error === "too_many_requests" ? json.message ?? "Too many attempts. Try again later." : "Invalid email or password.");
      return;
    }

    router.push(safeInternalPath(searchParams.get("next")));
  }

  return (
    <div className="auth-stack">
      <form className="auth-card" onSubmit={submit}>
        <Link href="/" className="auth-logo">Ummah <span>Connect</span></Link>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to your Ummah Connect account</p>

        <label className="auth-field">
          <span>Email</span>
          <input name="email" type="email" placeholder="you@example.com" autoComplete="email" />
          {fieldErrors.email ? <small>{fieldErrors.email}</small> : null}
        </label>

        <label className="auth-field">
          <span>Password</span>
          <div className="auth-password">
            <input name="password" type={showPassword ? "text" : "password"} placeholder="Your password" autoComplete="current-password" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password ? <small>{fieldErrors.password}</small> : null}
        </label>

        <div className="auth-link-row">
          <Link href="/reset-password">Forgot password?</Link>
        </div>

        {formError ? <p className="auth-form-error">{formError}</p> : null}

        <button className="auth-submit" disabled={loading}>
          {loading ? <><Loader2 className="spin" size={17} /> Signing in...</> : "Sign in"}
        </button>

        <div className="auth-divider" />
        <p className="auth-switch">Don&apos;t have an account? <Link href="/signup">Join free</Link></p>
      </form>
    </div>
  );
}
