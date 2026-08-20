"use client";

import { LeaderboardTabs } from "@/components/leaderboard/LeaderboardTabs";
import { ZoneTimeMatrix } from "@/components/leaderboard/ZoneTimeMatrix";
import { GhostComparisonCard } from "@/components/leaderboard/GhostComparisonCard";
import { Card } from "@/components/ui/Card";
import { ScreenLoading } from "@/components/ui/ScreenLoading";
import { useCurrentUserId } from "@/lib/hooks/useCurrentUser";
import { useZones } from "@/lib/hooks/useZones";
import { useLeaderboard, useZoneTimeStats } from "@/lib/hooks/useLeaderboard";
import { useProfile } from "@/lib/hooks/useProfile";
import { getGhostComparison } from "@/lib/utils/ghost";

export function LeaderboardScreen() {
  const currentUserId = useCurrentUserId();
  const { data: week } = useLeaderboard("week");
  const { data: month } = useLeaderboard("month");
  const { data: all } = useLeaderboard("all");
  const { data: zones } = useZones();
  const { data: zoneTimeStats } = useZoneTimeStats();
  const { data: profile } = useProfile(currentUserId);

  if (!week || !month || !all || !zones || !zoneTimeStats) {
    return <ScreenLoading />;
  }

  const ghostComparison = getGhostComparison(month, currentUserId);

  return (
    <div className="space-y-6 pb-6 pt-2">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink">לוח דירוג 🏆</h1>
        <p className="text-sm text-ink/50">מי שולט ברחובות החודש</p>
      </div>

      <Card className="flex items-center justify-between border-game-purple-dark bg-game-purple text-white">
        <div>
          <p className="text-sm text-white/70">הניקוד שלך</p>
          <p className="font-display text-3xl font-extrabold">{profile?.total_score ?? 0} נק&apos;</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-4xl">🚗</span>
          {(profile?.current_streak ?? 0) > 0 && (
            <span className="font-display text-xs font-bold text-white/80">
              🔥 רצף של {profile?.current_streak}
            </span>
          )}
        </div>
      </Card>

      <GhostComparisonCard comparison={ghostComparison} />

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-ink">החניינים המובילים</h2>
        <LeaderboardTabs leaderboards={{ week, month, all }} currentUserId={currentUserId} />
      </div>

      <div>
        <h2 className="mb-1 font-display text-lg font-bold text-ink">מתי כדאי לחפש חניה בכל אזור</h2>
        <p className="mb-3 text-xs text-ink/50">
          בחרו אזור כדי לראות באילו ימים ושעות דווחו הכי הרבה חניות בו (כל הזמנים)
        </p>
        <ZoneTimeMatrix zones={zones} stats={zoneTimeStats} />
      </div>
    </div>
  );
}
