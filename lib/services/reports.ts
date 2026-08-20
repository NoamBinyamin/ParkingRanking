import type { SupabaseClient } from "@supabase/supabase-js";
import type { Report, ReportWithZone } from "@/lib/types/database";

export async function createReport(
  supabase: SupabaseClient,
  userId: string,
  zoneId: string
): Promise<Report> {
  const { data, error } = await supabase
    .from("reports")
    .insert({ user_id: userId, zone_id: zoneId })
    .select()
    .single();

  if (error) throw error;
  return data as Report;
}

export async function getRecentReports(
  supabase: SupabaseClient,
  userId: string,
  limit = 10
): Promise<ReportWithZone[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*, zone:zones(name, icon, color)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as unknown as ReportWithZone[];
}
