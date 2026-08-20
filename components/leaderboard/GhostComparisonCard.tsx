import { Card } from "@/components/ui/Card";
import type { GhostComparison } from "@/lib/utils/ghost";

export function GhostComparisonCard({ comparison }: { comparison: GhostComparison }) {
  if (comparison.status === "no-data") {
    return (
      <Card className="border-game-blue bg-game-blue/10 text-center">
        <p className="text-sm text-ink/60">אף אחד עוד לא דיווח החודש. היו הראשונים! 🚀</p>
      </Card>
    );
  }

  if (comparison.status === "leading") {
    return (
      <Card className="flex items-center gap-3 border-game-yellow-dark bg-game-yellow/20">
        <span className="text-3xl">👑</span>
        <p className="font-display text-sm font-bold text-ink">
          אתם במקום הראשון החודש! שמרו על ההובלה 🔥
        </p>
      </Card>
    );
  }

  if (comparison.status === "not-competing") {
    return (
      <Card className="flex items-center gap-3 border-ink/10">
        <span className="text-3xl">👻</span>
        <div>
          <p className="font-display text-sm font-bold text-ink">
            ל-{comparison.leaderIcon} {comparison.leaderName} יש {comparison.leaderPoints} נק&apos; החודש
          </p>
          <p className="text-xs text-ink/50">דווחו על חניה כדי להצטרף למרוץ</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex items-center gap-3 border-ink/10">
      <span className="text-3xl">👻</span>
      <div>
        <p className="font-display text-sm font-bold text-ink">
          אתם {comparison.pointsBehind} נק&apos; מאחורי {comparison.leaderIcon} {comparison.leaderName}
        </p>
        <p className="text-xs text-ink/50">
          מקום #{comparison.rank} מתוך {comparison.totalRanked} החודש
        </p>
      </div>
    </Card>
  );
}
