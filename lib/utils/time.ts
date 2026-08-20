import { format } from "date-fns";

// Declared in chronological order (startHour ascending, day starting at
// 05:00) -- this order drives column order in the leaderboard's time
// matrix. "Night" wraps past midnight (21:00-05:00), so its hours array
// lists 21-23 then 0-4 explicitly rather than relying on a simple range.
export const HOUR_BUCKETS = [
  { label: "בוקר", hours: [5, 6, 7, 8, 9, 10, 11], startHour: 5, endHour: 12 },
  { label: "צהריים", hours: [12, 13, 14, 15], startHour: 12, endHour: 16 },
  { label: "אחר הצהריים", hours: [16, 17], startHour: 16, endHour: 18 },
  { label: "ערב", hours: [18, 19, 20], startHour: 18, endHour: 21 },
  { label: "לילה", hours: [21, 22, 23, 0, 1, 2, 3, 4], startHour: 21, endHour: 5 },
] as const;

// Index 0 = Sunday .. 6 = Saturday, matching both Postgres's extract(dow)
// and JS's Date#getDay(), so no conversion is needed between them.
export const DAY_LABELS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"] as const;

export function getHourBucketIndex(hour: number): number {
  const index = HOUR_BUCKETS.findIndex((bucket) => (bucket.hours as readonly number[]).includes(hour));
  return index === -1 ? 0 : index;
}

function formatHourLabel(hour: number): string {
  return `${(hour % 24).toString().padStart(2, "0")}:00`;
}

export function formatBucketRange(bucket: { startHour: number; endHour: number }): string {
  return `${formatHourLabel(bucket.startHour)}–${formatHourLabel(bucket.endHour)}`;
}

export function formatReportTime(iso: string): string {
  // Numeric-only (no English month names) so it reads fine inside RTL text.
  return format(new Date(iso), "dd/MM HH:mm");
}

export function formatJoinDate(iso: string): string {
  return format(new Date(iso), "dd/MM/yyyy");
}
