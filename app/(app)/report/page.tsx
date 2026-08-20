import { redirect } from "next/navigation";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getActiveZones } from "@/lib/services/zones";
import { getZoneTimeStats } from "@/lib/services/leaderboard";
import { ReportScreen } from "@/components/report/ReportScreen";

export default async function ReportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createSupabaseServerClient();
  const [zones, zoneTimeStats] = await Promise.all([
    getActiveZones(supabase),
    getZoneTimeStats(supabase),
  ]);

  return <ReportScreen userId={user.id} initialZones={zones} initialZoneTimeStats={zoneTimeStats} />;
}
