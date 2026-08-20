import type { LeaderboardEntry } from "@/lib/types/database";

export type GhostComparison =
  | { status: "no-data" }
  | { status: "leading" }
  | {
      status: "behind";
      pointsBehind: number;
      rank: number;
      totalRanked: number;
      leaderName: string;
      leaderIcon: string;
    }
  | { status: "not-competing"; leaderName: string; leaderIcon: string; leaderPoints: number };

/** Compares the current user against #1 on the monthly leaderboard, for a "ghost" chase prompt. */
export function getGhostComparison(
  monthly: LeaderboardEntry[],
  currentUserId: string | null
): GhostComparison {
  if (monthly.length === 0) return { status: "no-data" };

  const leader = monthly[0];

  const rank = currentUserId ? monthly.findIndex((entry) => entry.user_id === currentUserId) : -1;

  if (rank === 0) return { status: "leading" };

  if (rank === -1) {
    return {
      status: "not-competing",
      leaderName: leader.username,
      leaderIcon: leader.avatar_emoji,
      leaderPoints: leader.points,
    };
  }

  const me = monthly[rank];
  return {
    status: "behind",
    pointsBehind: leader.points - me.points,
    rank: rank + 1,
    totalRanked: monthly.length,
    leaderName: leader.username,
    leaderIcon: leader.avatar_emoji,
  };
}
