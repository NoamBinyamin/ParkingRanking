import type { SupabaseClient } from "@supabase/supabase-js";
import type { Zone } from "@/lib/types/database";

export async function getActiveZones(supabase: SupabaseClient): Promise<Zone[]> {
  const { data, error } = await supabase
    .from("zones")
    .select("*")
    .eq("is_active", true)
    .order("point_value", { ascending: false });

  if (error) throw error;
  return data as Zone[];
}
