"use client";

import { useState } from "react";
import type { LeaderboardEntry, LeaderboardPeriod } from "@/lib/types/database";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";

const PERIODS: { id: LeaderboardPeriod; label: string; emptyLabel: string }[] = [
  { id: "week", label: "השבוע", emptyLabel: "השבוע" },
  { id: "month", label: "החודש", emptyLabel: "החודש" },
  { id: "all", label: "כל הזמנים", emptyLabel: "עדיין" },
];

export function LeaderboardTabs({
  leaderboards,
  currentUserId,
}: {
  leaderboards: Record<LeaderboardPeriod, LeaderboardEntry[]>;
  currentUserId: string | null;
}) {
  const [period, setPeriod] = useState<LeaderboardPeriod>("month");
  const active = PERIODS.find((p) => p.id === period)!;

  return (
    <div>
      <div className="mb-3 flex rounded-2xl bg-ink/5 p-1">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`flex-1 rounded-xl py-2 text-sm font-display font-semibold transition-colors ${
              period === p.id ? "bg-white text-game-purple-dark shadow" : "text-ink/50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <LeaderboardList
        entries={leaderboards[period]}
        currentUserId={currentUserId}
        emptyLabel={active.emptyLabel}
      />
    </div>
  );
}
