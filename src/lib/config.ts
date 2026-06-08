const requiredKeys = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXTAUTH_URL",
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
    authSecret: readEnv("AUTH_SECRET"),
    nextauthUrl: readEnv("NEXTAUTH_URL"),
    paystackSecretKey: readEnv("PAYSTACK_SECRET_KEY"),
    paystackPublicKey: readEnv("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY"),
    appUrl: readEnv("NEXT_PUBLIC_APP_URL"),
  };
}
