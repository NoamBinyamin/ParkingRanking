import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLeaderboard, getZoneTimeStats } from "@/lib/services/leaderboard";
import { getMyProfile } from "@/lib/services/profile";
import { getActiveZones } from "@/lib/services/zones";
import { getGhostComparison } from "@/lib/utils/ghost";
import { LeaderboardScreen } from "@/components/leaderboard/LeaderboardScreen";

export default async function LeaderboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  const [week, month, all, zoneTimeStats, zones, profile] = await Promise.all([
    getLeaderboard(supabase, "week"),
    getLeaderboard(supabase, "month"),
    getLeaderboard(supabase, "all"),
    getZoneTimeStats(supabase),
    getActiveZones(supabase),
    data.user ? getMyProfile(supabase, data.user.id) : Promise.resolve(null),
  ]);

  const ghostComparison = getGhostComparison(month, data.user?.id ?? null);

  return (
    <LeaderboardScreen
      leaderboards={{ week, month, all }}
      zones={zones}
      zoneTimeStats={zoneTimeStats}
      ghostComparison={ghostComparison}
      currentUserId={data.user?.id ?? null}
      totalScore={profile?.total_score ?? 0}
      currentStreak={profile?.current_streak ?? 0}
    />
  );
}
