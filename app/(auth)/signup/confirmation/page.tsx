import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

type ConfirmationPageProps = {
  searchParams: { email?: string };
};

export default function SignupConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const email = searchParams.email ?? "your email";

  return (
    <main className="auth-page">
      <div className="auth-stack">
        <section className="auth-card auth-success">
          <Link href="/" className="auth-logo">Ummah <span>Connect</span></Link>
          <div className="success-icon"><CheckCircle2 size={30} /></div>
          <h1>Check your email to confirm your account.</h1>
          <p className="auth-subtitle">We sent a link to {email}. Click it to get started.</p>
          <Link className="auth-submit" href="/login">Back to sign in</Link>
        </section>
        <p className="auth-footer" lang="ar" dir="rtl">بسم الله الرحمن الرحيم</p>
      </div>
    </main>
  );
}
