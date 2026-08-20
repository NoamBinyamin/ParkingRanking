"use client";

import { AchievementsGrid } from "@/components/achievements/AchievementsGrid";
import { RecentReportsList } from "@/components/profile/RecentReportsList";
import { PushNotificationSettings } from "@/components/profile/PushNotificationSettings";
import { Card } from "@/components/ui/Card";
import { ScreenLoading } from "@/components/ui/ScreenLoading";
import { formatJoinDate } from "@/lib/utils/time";
import { useCurrentUserId } from "@/lib/hooks/useCurrentUser";
import { useProfile } from "@/lib/hooks/useProfile";
import { useMyAchievements, useMyProgress } from "@/lib/hooks/useAchievements";
import { useRecentReports } from "@/lib/hooks/useReports";

export function ProfileScreen() {
  const currentUserId = useCurrentUserId();
  const { data: profile } = useProfile(currentUserId);
  const { data: achievements } = useMyAchievements(currentUserId);
  const { data: progress } = useMyProgress(currentUserId);
  const { data: recentReports } = useRecentReports(currentUserId, 10);

  if (!profile || !achievements || !progress || !recentReports) {
    return <ScreenLoading />;
  }

  return (
    <div className="space-y-6 pb-6 pt-2">
      <div className="text-center">
        <div className="mx-auto mb-2 text-5xl animate-float">{profile.avatar_emoji}</div>
        <h1 className="font-display text-2xl font-bold text-ink">{profile.username}</h1>
        <p className="text-sm text-ink/50" dir="ltr">
          חבר/ה מתאריך {formatJoinDate(profile.created_at)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="font-display text-2xl font-extrabold text-game-purple-dark">{profile.total_score}</p>
          <p className="text-xs text-ink/50">נק&apos; סה&quot;כ</p>
        </Card>
        <Card className="text-center">
          <p className="font-display text-2xl font-extrabold text-game-yellow-dark">🔥 {profile.current_streak}</p>
          <p className="text-xs text-ink/50">רצף נוכחי</p>
        </Card>
        <Card className="text-center">
          <p className="font-display text-2xl font-extrabold text-game-green-dark">{profile.longest_streak}</p>
          <p className="text-xs text-ink/50">רצף שיא</p>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-ink">התגים שלי</h2>
        <AchievementsGrid unlocked={achievements} progress={progress} />
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-ink">דיווחים אחרונים</h2>
        <RecentReportsList reports={recentReports} />
      </div>

      <PushNotificationSettings userId={profile.id} />
    </div>
  );
}
