import type { LeaderboardEntry } from "@/lib/types/database";
import { Card } from "@/components/ui/Card";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";

export function LeaderboardList({
  entries,
  currentUserId,
  emptyLabel,
}: {
  entries: LeaderboardEntry[];
  currentUserId: string | null;
  /** Fits into "אין עדיין דיווחים {emptyLabel}." e.g. "השבוע", "החודש", "מעולם". */
  emptyLabel: string;
}) {
  if (entries.length === 0) {
    return (
      <Card className="text-center text-sm text-ink/50">
        אין עדיין דיווחים {emptyLabel}. תהיו הראשונים! 🚀
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-ink/5">
      {entries.slice(0, 10).map((entry, index) => (
        <LeaderboardRow
          key={entry.user_id}
          rank={index + 1}
          entry={entry}
          isCurrentUser={entry.user_id === currentUserId}
        />
      ))}
    </Card>
  );
}
