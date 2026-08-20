import { redirect } from "next/navigation";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getMyProfile } from "@/lib/services/profile";
import { getMyAchievements, getMyProgress } from "@/lib/services/achievements";
import { getRecentReports } from "@/lib/services/reports";
import { ProfileScreen } from "@/components/profile/ProfileScreen";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createSupabaseServerClient();
  const [profile, achievements, progress, recentReports] = await Promise.all([
    getMyProfile(supabase, user.id),
    getMyAchievements(supabase),
    getMyProgress(supabase),
    getRecentReports(supabase, user.id, 10),
  ]);

  return (
    <ProfileScreen
      userId={user.id}
      initialProfile={profile}
      initialAchievements={achievements}
      initialProgress={progress}
      initialRecentReports={recentReports}
    />
  );
}
