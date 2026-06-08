import { createSupabaseServiceClient } from "@/lib/supabase/server";

type RateLimitRow = {
  identifier: string;
  action: string;
  count: number | null;
  window_start: string | null;
  expires_at?: string | null;
};

type MemoryBucket = {
  count: number;
  windowStart: number;
};

const memoryBuckets = new Map<string, MemoryBucket>();

function key(identifier: string, action: string) {
  return `${action}:${identifier}`;
}

function tooMany(message = "Too many attempts. Try again later.") {
  return { limited: true as const, error: "too_many_requests", message };
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkMemoryLimit(identifier: string, action: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucketKey = key(identifier, action);
  const bucket = memoryBuckets.get(bucketKey);
  if (!bucket || now - bucket.windowStart >= windowMs) {
    memoryBuckets.set(bucketKey, { count: 1, windowStart: now });
    return { limited: false as const, count: 1 };
  }
  if (bucket.count >= limit) return tooMany();
  bucket.count += 1;
  return { limited: false as const, count: bucket.count };
}

export async function checkRateLimit(input: {
  identifier: string;
  action: string;
  limit: number;
  windowMs: number;
}) {
  const { identifier, action, limit, windowMs } = input;
  const now = new Date();
  const supabase = createSupabaseServiceClient();
  const table = supabase.from("rate_limits" as never);

  try {
    const { data } = await table
      .select("*")
      .eq("identifier", identifier)
      .eq("action", action)
      .maybeSingle();
    const row = data as RateLimitRow | null;
    const windowStart = row?.window_start ? new Date(row.window_start) : null;
    const expired = !windowStart || now.getTime() - windowStart.getTime() >= windowMs;
    const nextCount = expired ? 1 : (row?.count ?? 0) + 1;

    if (!expired && nextCount > limit) return tooMany();

    await table.upsert({
      identifier,
      action,
      count: nextCount,
      window_start: expired ? now.toISOString() : row?.window_start,
      expires_at: new Date((expired ? now.getTime() : windowStart.getTime()) + windowMs).toISOString(),
    } as never);

    return { limited: false as const, count: nextCount };
  } catch {
    return checkMemoryLimit(identifier, action, limit, windowMs);
  }
}

export async function isCooldownActive(identifier: string, action: string) {
  const now = new Date();
  const supabase = createSupabaseServiceClient();
  const table = supabase.from("rate_limits" as never);
  try {
    const { data } = await table
      .select("*")
      .eq("identifier", identifier)
      .eq("action", action)
      .maybeSingle();
    const row = data as RateLimitRow | null;
    if (!row?.expires_at) return false;
    return new Date(row.expires_at).getTime() > now.getTime();
  } catch {
    const bucket = memoryBuckets.get(key(identifier, action));
    return Boolean(bucket && Date.now() - bucket.windowStart < 15 * 60 * 1000 && bucket.count >= 5);
  }
}

export async function recordFailedLogin(email: string) {
  return checkRateLimit({
    identifier: email,
    action: `login_attempt_${email}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
}

export async function clearFailedLogin(email: string) {
  memoryBuckets.delete(key(email, `login_attempt_${email}`));
  const supabase = createSupabaseServiceClient();
  try {
    await supabase
      .from("rate_limits" as never)
      .delete()
      .eq("identifier", email)
      .eq("action", `login_attempt_${email}`);
  } catch {
    // In-memory fallback is already cleared.
  }
}
