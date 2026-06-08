'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

const industries = [
  "Tech & Software",
  "Halal Finance",
  "Healthcare",
  "Creative Arts",
  "Education",
  "Law & Policy",
  "Entrepreneurship",
  "Architecture",
  "Media & Journalism",
  "NGO & Nonprofit",
  "Other",
];

const careerStages = ["Student", "Early Career", "Mid-Level", "Senior", "Executive", "Entrepreneur"];
const cities = ["Lagos", "Abuja", "Kano", "Kaduna", "Port Harcourt", "Ibadan", "Maiduguri", "Sokoto", "Zaria", "Other"];

type SignupResponse = {
  data: { email?: string } | null;
  error: string | null;
  message?: string;
};

function passwordIssues(password: string) {
  const issues: string[] = [];
  if (password.length < 8) issues.push("Minimum 8 characters.");
  if (!/[A-Z]/.test(password)) issues.push("Add at least one uppercase letter.");
  if (!/[0-9]/.test(password)) issues.push("Add at least one number.");
  if (!/[^A-Za-z0-9]/.test(password)) issues.push("Add at least one special character.");
  return issues;
}

function passwordStrength(password: string) {
  if (!password) return { score: 0, label: "", color: "#ef4444" };
  let score = password.length >= 8 ? 2 : 1;
  if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) score = 3;
  if (score === 3 && /[^A-Za-z0-9]/.test(password)) score = 4;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#ef4444", "#ef4444", "#f97316", "#C9A84C", "#5ECDB5"];
  return { score, label: labels[score], color: colors[score] };
}

export default function SignupForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const strength = useMemo(() => passwordStrength(password), [password]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError(null);
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    const confirmPassword = String(form.get("confirm_password") ?? "");
    const nextErrors: Record<string, string> = {};

    for (const field of ["full_name", "email", "industry", "career_stage", "city"]) {
      if (!String(form.get(field) ?? "").trim()) nextErrors[field] = "This field is required.";
    }
    const issues = passwordIssues(password);
    if (issues.length) nextErrors.password = issues[0];
    if (password !== confirmPassword) nextErrors.confirm_password = "Passwords must match.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, password, plan, country: "Nigeria" }),
    });
    const json = await response.json() as SignupResponse;
    setLoading(false);

    if (!response.ok || json.error) {
      setFormError(json.error === "too_many_requests" ? json.message ?? "Too many attempts. Try again later." : "Signup could not be completed. Please review your details and try again.");
      return;
    }

    router.push(`/signup/confirmation?email=${encodeURIComponent(json.data?.email ?? String(body.email ?? ""))}`);
  }

  return (
    <div className="auth-stack">
      <form className="auth-card auth-card--wide" onSubmit={submit}>
        <Link href="/" className="auth-logo">Ummah <span>Connect</span></Link>
        <h1>Create your account</h1>
        <p className="auth-subtitle">Join Muslim professionals across Nigeria</p>

        <label className="auth-field">
          <span>Full Name</span>
          <input name="full_name" type="text" placeholder="Aisha Bello" autoComplete="name" />
          {errors.full_name ? <small>{errors.full_name}</small> : null}
        </label>

        <label className="auth-field">
          <span>Email</span>
          <input name="email" type="email" placeholder="you@example.com" autoComplete="email" />
          {errors.email ? <small>{errors.email}</small> : null}
        </label>

        <label className="auth-field">
          <span>Password</span>
          <div className="auth-password">
            <input name="password" type={showPassword ? "text" : "password"} placeholder="Create a password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.currentTarget.value)} />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="strength-track" aria-hidden="true">
            <span style={{ width: `${strength.score * 25}%`, background: strength.color }} />
          </div>
          {strength.label ? <em style={{ color: strength.color }}>{strength.label}</em> : null}
          {errors.password ? <small>{errors.password}</small> : null}
        </label>

        <label className="auth-field">
          <span>Confirm Password</span>
          <input name="confirm_password" type="password" placeholder="Confirm your password" autoComplete="new-password" />
          {errors.confirm_password ? <small>{errors.confirm_password}</small> : null}
        </label>

        <label className="auth-field">
          <span>Industry</span>
          <select name="industry" defaultValue="">
            <option value="" disabled>Select industry</option>
            {industries.map((industry) => <option key={industry}>{industry}</option>)}
          </select>
          {errors.industry ? <small>{errors.industry}</small> : null}
        </label>

        <label className="auth-field">
          <span>Career Stage</span>
          <select name="career_stage" defaultValue="">
            <option value="" disabled>Select career stage</option>
            {careerStages.map((stage) => <option key={stage}>{stage}</option>)}
          </select>
          {errors.career_stage ? <small>{errors.career_stage}</small> : null}
        </label>

        <label className="auth-field">
          <span>City</span>
          <select name="city" defaultValue="">
            <option value="" disabled>Select city</option>
            {cities.map((city) => <option key={city}>{city}</option>)}
          </select>
          {errors.city ? <small>{errors.city}</small> : null}
        </label>

        <fieldset className="plan-field">
          <legend>Plan</legend>
          <label className={`plan-card ${plan === "free" ? "plan-card--selected" : ""}`}>
            <input type="radio" name="plan" value="free" checked={plan === "free"} onChange={() => setPlan("free")} />
            <strong>Free</strong>
            <span>₦0/mo</span>
          </label>
          <label className={`plan-card plan-card--pro ${plan === "pro" ? "plan-card--selected" : ""}`}>
            <input type="radio" name="plan" value="pro" checked={plan === "pro"} onChange={() => setPlan("pro")} />
            <span className="recommended">Recommended</span>
            <strong>Pro</strong>
            <span>₦9,000/mo</span>
          </label>
        </fieldset>

        {formError ? <p className="auth-form-error">{formError}</p> : null}

        <button className="auth-submit" disabled={loading}>
          {loading ? <><Loader2 className="spin" size={17} /> Creating account...</> : "Create account"}
        </button>
        <p className="terms-line">By joining you agree to our Terms and Privacy Policy</p>

        <div className="auth-divider" />
        <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
