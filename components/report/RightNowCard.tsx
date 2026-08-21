"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { HOUR_BUCKETS, getHourBucketIndex } from "@/lib/utils/time";
import type { Zone, ZoneTimeStat } from "@/lib/types/database";

export function RightNowCard({ zones, stats }: { zones: Zone[]; stats: ZoneTimeStat[] }) {
  // Computed after mount (not during SSR) so "now" reflects the visitor's
  // own clock instead of the server's render time.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  if (!now || zones.length === 0) return null;

  const bucket = HOUR_BUCKETS[getHourBucketIndex(now.getHours())];
  const bucketHours = bucket.hours as readonly number[];

  // Ranked purely by all-time report volume in this hour-bucket, across
  // every day of the week -- the day-of-week dimension isn't used here,
  // so the recommendation is backed by the full history, not a single
  // weekday's thin slice of it.
  const ranked = zones
    .map((zone) => ({
      zone,
      count: stats
        .filter((s) => s.zone_id === zone.id && bucketHours.includes(s.hour_of_day))
        .reduce((sum, s) => sum + Number(s.report_count), 0),
    }))
    .sort((a, b) => b.count - a.count);

  const top = ranked[0];
  const hasData = Boolean(top && top.count > 0);

  return (
    <Card className="relative overflow-hidden border-game-yellow-dark bg-game-yellow/20 px-3 py-1.5">
      <div className="flex items-center gap-2">
        <motion.span
          className="shrink-0 text-lg"
          animate={{ x: ["-10%", "10%", "-10%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          🚗
        </motion.span>
        {hasData && top ? (
          <p className="min-w-0 truncate font-display text-xs font-bold text-ink">
            כדאי לנסות עכשיו: {top.zone.icon} {top.zone.name}
          </p>
        ) : (
          <p className="min-w-0 truncate text-xs text-ink/60">
            אין עדיין מספיק דיווחים ב{bucket.label} כדי להמליץ
          </p>
        )}
      </div>
    </Card>
  );
}
