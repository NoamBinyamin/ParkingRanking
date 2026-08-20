"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createReport, getRecentReports } from "@/lib/services/reports";
import { getMyAchievements } from "@/lib/services/achievements";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { MAX_SPOT_COUNT } from "@/lib/reportTypes";
import type { Report, ReportType } from "@/lib/types/database";

const MIN_REPORT_INTERVAL_MINUTES = 15;

export async function submitParkingReport(zoneId: string, reportType: ReportType, spotCount: number) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("משתמש לא מחובר");

  const [lastReport] = await getRecentReports(supabase, data.user.id, 1);

  if (lastReport) {
    const minutesSince = (Date.now() - new Date(lastReport.created_at).getTime()) / 60000;
    if (minutesSince < MIN_REPORT_INTERVAL_MINUTES) {
      return {
        status: "too-soon" as const,
        lastReport,
        minutesRemaining: Math.max(1, Math.ceil(MIN_REPORT_INTERVAL_MINUTES - minutesSince)),
      };
    }
  }

  const before = await getMyAchievements(supabase);
  const beforeIds = new Set(before.map((a) => a.achievement_id));

  // Clamped here too (not just in the DB trigger) so the client never
  // even sees an out-of-range value reflected back at it.
  const clampedSpotCount = reportType === "saw" ? Math.max(1, Math.min(MAX_SPOT_COUNT, spotCount)) : 1;
  const report = await createReport(supabase, data.user.id, zoneId, reportType, clampedSpotCount);

  const after = await getMyAchievements(supabase);
  const newlyUnlocked = ACHIEVEMENTS.filter(
    (achievement) => !beforeIds.has(achievement.id) && after.some((a) => a.achievement_id === achievement.id)
  );

  revalidatePath("/leaderboard");
  return { status: "created" as const, report, newlyUnlocked };
}

export async function replaceLastReport(newZoneId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("משתמש לא מחובר");

  const { data: updated, error } = await supabase
    .rpc("replace_last_report", { new_zone_id: newZoneId })
    .single();
  if (error) throw error;

  revalidatePath("/leaderboard");
  return updated as Report;
}
