"use client";

import useSWR from "swr";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getLeaderboard, getZoneTimeStats } from "@/lib/services/leaderboard";
import type { LeaderboardEntry, LeaderboardPeriod, ZoneTimeStat } from "@/lib/types/database";

export function useLeaderboard(period: LeaderboardPeriod, fallbackData?: LeaderboardEntry[]) {
  const supabase = createSupabaseBrowserClient();
  return useSWR(["leaderboard", period], () => getLeaderboard(supabase, period), { fallbackData });
}

export function useZoneTimeStats(fallbackData?: ZoneTimeStat[]) {
  const supabase = createSupabaseBrowserClient();
  return useSWR("zone-time-stats", () => getZoneTimeStats(supabase), { fallbackData });
}
