import type { Profile, ReportWithZone, UserAchievement } from "@/lib/types/database";
import type { AchievementProgress } from "@/lib/achievements";
import { AchievementsGrid } from "@/components/achievements/AchievementsGrid";
import { RecentReportsList } from "@/components/profile/RecentReportsList";
import { Card } from "@/components/ui/Card";
import { formatJoinDate } from "@/lib/utils/time";

export function ProfileScreen({
  profile,
  achievements,
  progress,
  recentReports,
}: {
  profile: Profile;
  achievements: UserAchievement[];
  progress: AchievementProgress;
  recentReports: ReportWithZone[];
}) {
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
    </div>
  );
}
