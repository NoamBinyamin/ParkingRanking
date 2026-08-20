"use client";

import useSWR from "swr";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getRecentReports } from "@/lib/services/reports";
import type { ReportWithZone } from "@/lib/types/database";

export function useRecentReports(
  userId: string | null | undefined,
  limit = 10,
  fallbackData?: ReportWithZone[]
) {
  const supabase = createSupabaseBrowserClient();
  return useSWR(userId ? ["recent-reports", userId, limit] : null, () => getRecentReports(supabase, userId!, limit), {
    fallbackData,
  });
}
