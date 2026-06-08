import { Suspense } from 'react';
import SignupForm from './signup-form';

export default function SignupPage() {
  return (
    <main className="auth-page">
      <Suspense fallback={<div className="auth-card">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </main>
  );
}
