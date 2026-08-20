import { cn } from "@/lib/utils/cn";
import type { LeaderboardEntry } from "@/lib/types/database";

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardRow({
  rank,
  entry,
  isCurrentUser,
}: {
  rank: number;
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 py-3 first:pt-0 last:pb-0",
        isCurrentUser && "rounded-2xl bg-game-purple/5 px-2"
      )}
    >
      <span className="w-7 text-center font-display font-bold text-ink/40">
        {MEDALS[rank - 1] ?? rank}
      </span>
      <span className="text-2xl">{entry.avatar_emoji}</span>
      <span className="flex-1 font-display font-semibold text-ink">
        {entry.username}
        {isCurrentUser && <span className="ms-2 text-xs text-game-purple-dark">(את/ה)</span>}
      </span>
      <span className="font-display font-bold text-game-purple-dark">{entry.points} נק&apos;</span>
    </div>
  );
}
