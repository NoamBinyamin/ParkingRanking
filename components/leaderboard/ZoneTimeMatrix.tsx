"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { hexWithAlpha } from "@/lib/utils/color";
import { HOUR_BUCKETS, DAY_LABELS, formatBucketRange } from "@/lib/utils/time";
import type { Zone, ZoneTimeStat } from "@/lib/types/database";

export function ZoneTimeMatrix({ zones, stats }: { zones: Zone[]; stats: ZoneTimeStat[] }) {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(zones[0]?.id ?? null);
  const zone = zones.find((z) => z.id === selectedZoneId) ?? zones[0];

  if (!zone) {
    return (
      <Card className="text-center text-sm text-ink/50">אין עדיין אזורים להצגה</Card>
    );
  }

  const zoneStats = stats.filter((s) => s.zone_id === zone.id);

  function countFor(dayOfWeek: number, hours: readonly number[]) {
    return zoneStats
      .filter((s) => s.day_of_week === dayOfWeek && hours.includes(s.hour_of_day))
      .reduce((sum, s) => sum + Number(s.report_count), 0);
  }

  const maxCount = Math.max(
    1,
    ...DAY_LABELS.flatMap((_, day) => HOUR_BUCKETS.map((bucket) => countFor(day, bucket.hours)))
  );

  const hasAnyData = maxCount > 1 || zoneStats.length > 0;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => setSelectedZoneId(z.id)}
            className={cn(
              "flex items-center gap-1 rounded-full border-2 px-3 py-1.5 text-sm font-display font-semibold transition-colors",
              z.id === zone.id
                ? "border-game-purple bg-game-purple/10 text-game-purple-dark"
                : "border-ink/10 text-ink/50"
            )}
          >
            <span>{z.icon}</span>
            {z.name}
          </button>
        ))}
      </div>

      {!hasAnyData ? (
        <p className="text-center text-sm text-ink/50">
          אין עדיין מספיק דיווחים על {zone.name} כדי לזהות דפוסים 📊
        </p>
      ) : (
        <div
          className="overflow-x-auto"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <table className="w-full min-w-[460px] text-sm">
            <thead>
              <tr>
                <th className="pb-2 text-start font-display text-xs text-ink/50">יום</th>
                {HOUR_BUCKETS.map((bucket) => (
                  <th key={bucket.label} className="pb-2 text-center font-display text-xs text-ink/50">
                    <div>{bucket.label}</div>
                    <div className="font-normal text-ink/35" dir="ltr">
                      {formatBucketRange(bucket)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAY_LABELS.map((label, day) => (
                <tr key={label}>
                  <td className="py-1 font-display text-xs font-semibold text-ink/70">{label}</td>
                  {HOUR_BUCKETS.map((bucket) => {
                    const count = countFor(day, bucket.hours);
                    const intensity = count / maxCount;
                    return (
                      <td key={bucket.label} className="p-1">
                        <div
                          className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg font-display text-xs font-bold"
                          style={{
                            backgroundColor:
                              count > 0
                                ? hexWithAlpha(zone.color, 0.15 + intensity * 0.75)
                                : "color-mix(in srgb, var(--color-ink) 4%, transparent)",
                            color:
                              intensity > 0.4 ? "white" : "color-mix(in srgb, var(--color-ink) 60%, transparent)",
                          }}
                        >
                          {count > 0 ? count : ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
