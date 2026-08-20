"use client";

import useSWR, { useSWRConfig } from "swr";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getMyProfile } from "@/lib/services/profile";
import type { Profile } from "@/lib/types/database";

export function profileKey(userId: string | null | undefined) {
  return userId ? (["profile", userId] as const) : null;
}

export function useProfile(userId: string | null | undefined, fallbackData?: Profile | null) {
  const supabase = createSupabaseBrowserClient();
  return useSWR(profileKey(userId), () => getMyProfile(supabase, userId!), {
    fallbackData: fallbackData ?? undefined,
  });
}

/** Optimistically bumps the cached score by `delta` (e.g. right after reporting), ahead of revalidation. */
export function useOptimisticScore(userId: string | null | undefined) {
  const { mutate } = useSWRConfig();
  return function addPoints(delta: number) {
    if (!userId) return;
    mutate(
      profileKey(userId),
      (current: Profile | null | undefined) =>
        current ? { ...current, total_score: current.total_score + delta } : current,
      { revalidate: false }
    );
  };
}
