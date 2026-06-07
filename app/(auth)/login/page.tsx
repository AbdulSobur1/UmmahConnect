import { Suspense } from 'react';
import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <main className="page" style={{ display: "grid", placeItems: "center", padding: 20 }}>
      <Suspense fallback={<div className="card" style={{ width: "min(460px, 100%)", padding: 24 }}>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
