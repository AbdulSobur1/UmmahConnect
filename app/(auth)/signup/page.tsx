import { Suspense } from 'react';
import SignupForm from './signup-form';

export default function SignupPage() {
  return (
    <main className="page" style={{ display: "grid", placeItems: "center", padding: 20 }}>
      <Suspense fallback={<div className="card" style={{ width: "min(620px, 100%)", padding: 24 }}>Loading...</div>}>
        <SignupForm />
      </Suspense>
    </main>
  );
}
