import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types/database";

export async function getMyProfile(supabase: SupabaseClient, userId: string): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

  if (error) throw error;
  return data as Profile;
}
