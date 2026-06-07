import { Suspense } from 'react';
import SignupForm from './signup-form';

export default function SignupPage() {
  return (
    <main className="page auth-page">
      <Suspense fallback={<div className="card auth-card">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </main>
  );
}
