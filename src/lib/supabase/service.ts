import { createClient } from "@supabase/supabase-js";

// Service role client – bypasses RLS. Use only in API routes / webhooks where
// the request is authenticated via webhook signature or other server-side auth.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
