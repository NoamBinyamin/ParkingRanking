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

// Zones are named by street + letter (e.g. "sirkin-a", "katznelson-b") --
// both letter's zones sit on the same reference map, so they share one
// highlight image regardless of which street they're actually on.
// "joker" gets its own image; anything else (e.g. the joke "sachla" zone,
// which has no street of its own on the map) has no highlight at all.
export function getZoneMapImage(slug: string): string | null {
  if (slug === "joker") return "/maps/joker.webp";
  if (slug.endsWith("-a")) return "/maps/a.webp";
  if (slug.endsWith("-b")) return "/maps/b.webp";
  return null;
}
