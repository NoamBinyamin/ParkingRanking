"use client";

import useSWR from "swr";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** The signed-in user's id, read from the (already-synced) browser session -- no network round-trip. */
export function useCurrentUserId(fallbackUserId?: string | null) {
  const supabase = createSupabaseBrowserClient();
  const { data } = useSWR(
    "auth-user-id",
    async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
    { fallbackData: fallbackUserId }
  );
  return data ?? null;
}
