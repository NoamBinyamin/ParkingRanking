import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getLeaderboard, getZoneTimeStats } from "@/lib/services/leaderboard";
import { getMyProfile } from "@/lib/services/profile";
import { getActiveZones } from "@/lib/services/zones";
import { getGhostComparison } from "@/lib/utils/ghost";
import { LeaderboardScreen } from "@/components/leaderboard/LeaderboardScreen";

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  const supabase = await createSupabaseServerClient();

  const [week, month, all, zoneTimeStats, zones, profile] = await Promise.all([
    getLeaderboard(supabase, "week"),
    getLeaderboard(supabase, "month"),
    getLeaderboard(supabase, "all"),
    getZoneTimeStats(supabase),
    getActiveZones(supabase),
    user ? getMyProfile(supabase, user.id) : Promise.resolve(null),
  ]);

  const ghostComparison = getGhostComparison(month, user?.id ?? null);

  return (
    <LeaderboardScreen
      leaderboards={{ week, month, all }}
      zones={zones}
      zoneTimeStats={zoneTimeStats}
      ghostComparison={ghostComparison}
      currentUserId={user?.id ?? null}
      totalScore={profile?.total_score ?? 0}
      currentStreak={profile?.current_streak ?? 0}
    />
  );
}
