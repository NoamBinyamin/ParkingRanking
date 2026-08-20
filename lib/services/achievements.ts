import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserAchievement } from "@/lib/types/database";
import type { AchievementProgress } from "@/lib/achievements";

export async function getMyAchievements(supabase: SupabaseClient): Promise<UserAchievement[]> {
  const { data, error } = await supabase.rpc("get_my_achievements");
  if (error) throw error;
  return data as UserAchievement[];
}

type ProgressRow = {
  total_reports: number;
  jackpot_reports: number;
  night_reports: number;
  current_streak: number;
};

export async function getMyProgress(supabase: SupabaseClient): Promise<AchievementProgress> {
  const { data, error } = await supabase.rpc("get_my_progress").single();
  if (error) throw error;
  const row = data as ProgressRow;

  return {
    totalReports: Number(row.total_reports),
    jackpotReports: Number(row.jackpot_reports),
    nightReports: Number(row.night_reports),
    currentStreak: Number(row.current_streak),
  };
}
