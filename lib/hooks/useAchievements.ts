"use client";

import useSWR from "swr";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getMyAchievements, getMyProgress } from "@/lib/services/achievements";
import type { UserAchievement } from "@/lib/types/database";
import type { AchievementProgress } from "@/lib/achievements";

export function useMyAchievements(userId: string | null | undefined, fallbackData?: UserAchievement[]) {
  const supabase = createSupabaseBrowserClient();
  return useSWR(userId ? ["achievements", userId] : null, () => getMyAchievements(supabase), {
    fallbackData,
  });
}

export function useMyProgress(userId: string | null | undefined, fallbackData?: AchievementProgress) {
  const supabase = createSupabaseBrowserClient();
  return useSWR(userId ? ["achievement-progress", userId] : null, () => getMyProgress(supabase), {
    fallbackData,
  });
}
