export type AchievementMetric = "totalReports" | "jackpotReports" | "nightReports" | "currentStreak";

export type AchievementProgress = {
  totalReports: number;
  jackpotReports: number;
  nightReports: number;
  currentStreak: number;
};

export const EMPTY_PROGRESS: AchievementProgress = {
  totalReports: 0,
  jackpotReports: 0,
  nightReports: 0,
  currentStreak: 0,
};

export type AchievementDefinition = {
  id: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  metric: AchievementMetric;
};

// The static catalog. Unlock criteria are enforced server-side in
// check_achievements() (supabase/schema.sql) -- this is display metadata
// only, matched against unlocked ids from get_my_achievements(). threshold
// + metric mirror those same criteria so the UI can show "2/3" progress
// without re-deriving the rule.
export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first_park",
    name: "חניה ראשונה",
    description: "דווחו על חניה אחת",
    icon: "🅿️",
    threshold: 1,
    metric: "totalReports",
  },
  {
    id: "streak_3",
    name: "על הגל",
    description: "דווחו 3 ימים ברצף",
    icon: "🔥",
    threshold: 3,
    metric: "currentStreak",
  },
  {
    id: "streak_7",
    name: "שבוע שלם",
    description: "דווחו 7 ימים ברצף",
    icon: "⚡",
    threshold: 7,
    metric: "currentStreak",
  },
  {
    id: "jackpot_hunter",
    name: "ציד ג׳קפוט",
    description: "מצאו את הג׳וקר 3 פעמים",
    icon: "🃏",
    threshold: 3,
    metric: "jackpotReports",
  },
  {
    id: "night_owl",
    name: "ינשוף לילה",
    description: "דווחו 5 פעמים בין 00:00–06:00",
    icon: "🌙",
    threshold: 5,
    metric: "nightReports",
  },
  {
    id: "century",
    name: "מאה חניות",
    description: "צברו 100 דיווחים",
    icon: "💯",
    threshold: 100,
    metric: "totalReports",
  },
];
