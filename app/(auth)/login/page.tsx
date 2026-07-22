import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-stack">
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#1A6B5C",
              colorBackground: "#0D1B1E",
              colorText: "#ffffff",
              colorInputBackground: "#132420",
              colorInputText: "#ffffff",
              borderRadius: "12px",
            },
          }}
          redirectUrl="/feed"
          afterSignInUrl="/feed"
        />
      </div>
    </main>
  );
}
