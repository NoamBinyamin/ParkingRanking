import type { ReportType } from "@/lib/types/database";

// Keep in sync with set_report_points() in supabase/schema.sql -- the
// server is the source of truth (it enforces this regardless of what a
// client sends), this is just so the UI can preview it accurately.
export const SAW_BONUS_POINTS = 2;
export const MAX_SPOT_COUNT = 5;

export const REPORT_TYPE_LABELS: Record<ReportType, { label: string; icon: string }> = {
  parked: { label: "חניתי כאן", icon: "🚗" },
  saw: { label: "ראיתי מקום פנוי", icon: "👀" },
};
