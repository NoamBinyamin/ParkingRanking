export type Profile = {
  id: string;
  username: string;
  avatar_emoji: string;
  total_score: number;
  current_streak: number;
  longest_streak: number;
  last_report_date: string | null;
  created_at: string;
};

export type Zone = {
  id: string;
  name: string;
  slug: string;
  point_value: number;
  color: string;
  icon: string;
  description: string;
  is_active: boolean;
  created_at: string;
};

export type Report = {
  id: string;
  user_id: string;
  zone_id: string;
  points_awarded: number;
  created_at: string;
};

export type ReportWithZone = Report & {
  zone: Pick<Zone, "name" | "icon" | "color">;
};

export type LeaderboardPeriod = "week" | "month" | "all";

export type LeaderboardEntry = {
  user_id: string;
  username: string;
  avatar_emoji: string;
  points: number;
};

export type ZoneTimeStat = {
  zone_id: string;
  zone_name: string;
  day_of_week: number;
  hour_of_day: number;
  report_count: number;
};

export type UserAchievement = {
  achievement_id: string;
  unlocked_at: string;
};
