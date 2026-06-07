import { Suspense } from 'react';
import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <main className="page auth-page">
      <Suspense fallback={<div className="card auth-card">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
