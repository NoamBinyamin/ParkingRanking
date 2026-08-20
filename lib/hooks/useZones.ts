"use client";

import useSWR from "swr";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getActiveZones } from "@/lib/services/zones";
import type { Zone } from "@/lib/types/database";

export function useZones(fallbackData?: Zone[]) {
  const supabase = createSupabaseBrowserClient();
  return useSWR("zones", () => getActiveZones(supabase), { fallbackData });
}
