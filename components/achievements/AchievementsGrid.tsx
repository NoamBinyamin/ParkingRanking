import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { ACHIEVEMENTS, type AchievementProgress } from "@/lib/achievements";
import type { UserAchievement } from "@/lib/types/database";

export function AchievementsGrid({
  unlocked,
  progress,
}: {
  unlocked: UserAchievement[];
  progress: AchievementProgress;
}) {
  const unlockedIds = new Set(unlocked.map((a) => a.achievement_id));

  return (
    <Card className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {ACHIEVEMENTS.map((achievement) => {
        const isUnlocked = unlockedIds.has(achievement.id);
        const current = Math.min(progress[achievement.metric], achievement.threshold);
        const percent = Math.round((current / achievement.threshold) * 100);

        return (
          <div
            key={achievement.id}
            className={cn(
              "flex flex-col gap-1 rounded-2xl border p-3",
              isUnlocked ? "border-game-yellow-dark bg-game-yellow/15" : "border-ink/10 bg-ink/5"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl" style={{ filter: isUnlocked ? "none" : "grayscale(1)" }}>
                {achievement.icon}
              </span>
              <span className="font-display text-sm font-bold leading-tight text-ink">
                {achievement.name}
              </span>
            </div>
            <p className="text-xs leading-snug text-ink/50">{achievement.description}</p>
            {isUnlocked ? (
              <span className="mt-1 w-fit rounded-full bg-game-green/15 px-2 py-0.5 text-xs font-bold text-game-green-dark">
                ✓ הושג
              </span>
            ) : (
              <div className="mt-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                  <div className="h-full rounded-full bg-game-purple" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-0.5 text-xs text-ink/40" dir="ltr">
                  {current}/{achievement.threshold}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
}
