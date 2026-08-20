import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getLeaderboard, getZoneTimeStats } from "@/lib/services/leaderboard";
import { getMyProfile } from "@/lib/services/profile";
import { getActiveZones } from "@/lib/services/zones";
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

  return (
    <LeaderboardScreen
      userId={user?.id ?? null}
      initialLeaderboards={{ week, month, all }}
      initialZones={zones}
      initialZoneTimeStats={zoneTimeStats}
      initialProfile={profile}
    />
  );
}
