"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a dummy client in demo/offline mode to prevent browser-side crash
    return {
      channel: () => ({
        on: () => ({
          subscribe: () => ({})
        })
      }),
      removeChannel: () => {}
    } as any;
  }

  return createBrowserClient(url, key);
}
