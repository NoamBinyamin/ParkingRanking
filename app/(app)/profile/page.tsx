import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyProfile } from "@/lib/services/profile";
import { getMyAchievements, getMyProgress } from "@/lib/services/achievements";
import { getRecentReports } from "@/lib/services/reports";
import { ProfileScreen } from "@/components/profile/ProfileScreen";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const [profile, achievements, progress, recentReports] = await Promise.all([
    getMyProfile(supabase, data.user.id),
    getMyAchievements(supabase),
    getMyProgress(supabase),
    getRecentReports(supabase, data.user.id, 10),
  ]);

  return (
    <ProfileScreen
      profile={profile}
      achievements={achievements}
      progress={progress}
      recentReports={recentReports}
    />
  );
}
