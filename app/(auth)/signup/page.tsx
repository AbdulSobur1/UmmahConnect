import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <main className="auth-page">
      <div className="auth-stack">
        <SignUp
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
          afterSignUpUrl="/feed"
        />
      </div>
    </main>
  );
}
