import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveZones } from "@/lib/services/zones";
import { getZoneTimeStats } from "@/lib/services/leaderboard";
import { ReportScreen } from "@/components/report/ReportScreen";

export default async function ReportPage() {
  const supabase = await createSupabaseServerClient();
  const [zones, zoneTimeStats] = await Promise.all([
    getActiveZones(supabase),
    getZoneTimeStats(supabase),
  ]);

  return <ReportScreen zones={zones} zoneTimeStats={zoneTimeStats} />;
}
