import { createServiceClient } from '@/lib/supabase/service';

type MemoryBucket = {
  count: number;
  windowStart: number;
};

const memoryBuckets = new Map<string, MemoryBucket>();

function key(identifier: string, action: string) {
  return `${action}:${identifier}`;
}

function tooMany(message = 'Too many attempts. Try again later.') {
  return { limited: true as const, error: 'too_many_requests', message };
}

export function getClientIp(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
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

  try {
    const supabase = createServiceClient();
    const { data: existing } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('action', action)
      .maybeSingle();

    const windowStart = existing?.window_start ? new Date(existing.window_start) : null;
    const expired = !windowStart || now.getTime() - windowStart.getTime() >= windowMs;
    const nextCount = expired ? 1 : (existing?.count ?? 0) + 1;

    if (!expired && nextCount > limit) return tooMany();

    const { error } = await supabase.from('rate_limits').upsert(
      {
        identifier,
        action,
        count: nextCount,
        window_start: expired ? now.toISOString() : existing?.window_start ?? now.toISOString(),
      },
      { onConflict: 'identifier, action, window_start' },
    );

    if (error) throw error;

    return { limited: false as const, count: nextCount };
  } catch {
    return checkMemoryLimit(identifier, action, limit, windowMs);
  }
}

