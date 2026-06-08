import { Suspense } from 'react';
import Link from 'next/link';
import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <main className="auth-page">
      <Suspense fallback={
        <div className="auth-stack">
          <div className="auth-card">
            <Link href="/" className="auth-logo">Ummah <span>Connect</span></Link>
            <h1>Welcome back</h1>
            <p className="auth-subtitle">Sign in to your Ummah Connect account</p>
          </div>
          <p className="auth-footer" lang="ar" dir="rtl">بسم الله الرحمن الرحيم</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
