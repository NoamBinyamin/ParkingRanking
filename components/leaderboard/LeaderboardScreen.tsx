import type { LeaderboardEntry, LeaderboardPeriod, Zone, ZoneTimeStat } from "@/lib/types/database";
import type { GhostComparison } from "@/lib/utils/ghost";
import { LeaderboardTabs } from "@/components/leaderboard/LeaderboardTabs";
import { ZoneTimeMatrix } from "@/components/leaderboard/ZoneTimeMatrix";
import { GhostComparisonCard } from "@/components/leaderboard/GhostComparisonCard";
import { Card } from "@/components/ui/Card";

export function LeaderboardScreen({
  leaderboards,
  zones,
  zoneTimeStats,
  ghostComparison,
  currentUserId,
  totalScore,
  currentStreak,
}: {
  leaderboards: Record<LeaderboardPeriod, LeaderboardEntry[]>;
  zones: Zone[];
  zoneTimeStats: ZoneTimeStat[];
  ghostComparison: GhostComparison;
  currentUserId: string | null;
  totalScore: number;
  currentStreak: number;
}) {
  return (
    <div className="space-y-6 pb-6 pt-2">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink">לוח דירוג 🏆</h1>
        <p className="text-sm text-ink/50">מי שולט ברחובות החודש</p>
      </div>

      <Card className="flex items-center justify-between border-game-purple-dark bg-game-purple text-white">
        <div>
          <p className="text-sm text-white/70">הניקוד שלך</p>
          <p className="font-display text-3xl font-extrabold">{totalScore} נק&apos;</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-4xl">🚗</span>
          {currentStreak > 0 && (
            <span className="font-display text-xs font-bold text-white/80">🔥 רצף של {currentStreak}</span>
          )}
        </div>
      </Card>

      <GhostComparisonCard comparison={ghostComparison} />

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-ink">החניינים המובילים</h2>
        <LeaderboardTabs leaderboards={leaderboards} currentUserId={currentUserId} />
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
