import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeaderboardEntry, LeaderboardPeriod, ZoneTimeStat } from "@/lib/types/database";

export async function getLeaderboard(
  supabase: SupabaseClient,
  period: LeaderboardPeriod
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc("get_leaderboard", { period });
  if (error) throw error;
  return data as LeaderboardEntry[];
}

export async function getZoneTimeStats(supabase: SupabaseClient): Promise<ZoneTimeStat[]> {
  const { data, error } = await supabase.rpc("get_zone_day_hour_stats");
  if (error) throw error;
  return data as ZoneTimeStat[];
}
