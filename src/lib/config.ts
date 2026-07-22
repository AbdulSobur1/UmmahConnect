const requiredKeys = [
  "DATABASE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "PAYSTACK_SECRET_KEY",
  "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
  "NEXT_PUBLIC_APP_URL",
] as const;

export type EnvKey = (typeof requiredKeys)[number];

function readEnv(key: EnvKey): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getServerConfig() {
  return {
    databaseUrl: readEnv("DATABASE_URL"),
    clerkPublishableKey: readEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
    clerkSecretKey: readEnv("CLERK_SECRET_KEY"),
    paystackSecretKey: readEnv("PAYSTACK_SECRET_KEY"),
    paystackPublicKey: readEnv("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY"),
    appUrl: readEnv("NEXT_PUBLIC_APP_URL"),
  };
}
