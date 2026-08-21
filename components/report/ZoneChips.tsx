"use client";

import { formatPoints } from "@/lib/utils/points";
import { hexWithAlpha } from "@/lib/utils/color";
import type { Zone } from "@/lib/types/database";

export function ZoneChips({
  zones,
  selectedZoneId,
  onSelect,
  displayPoints,
}: {
  zones: Zone[];
  selectedZoneId: string | null;
  onSelect: (zoneId: string) => void;
  /** Overrides the points shown -- e.g. the flat "saw" bonus instead of each zone's own point_value. */
  displayPoints?: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {zones.map((zone) => {
        const isSelected = zone.id === selectedZoneId;
        const points = displayPoints ?? zone.point_value;

        return (
          <button
            key={zone.id}
            onClick={() => onSelect(zone.id)}
            style={
              isSelected
                ? { borderColor: zone.color, backgroundColor: hexWithAlpha(zone.color, 0.14) }
                : undefined
            }
            className={`flex min-w-0 items-center justify-center gap-1 rounded-full border px-1.5 py-1 text-[11px] font-display font-semibold transition-colors ${
              isSelected ? "text-ink" : "border-ink/10 text-ink/50"
            }`}
          >
            <span className="shrink-0 text-sm leading-none">{zone.icon}</span>
            <span className="truncate">{zone.name}</span>
            <span className="shrink-0 text-[9px] font-bold text-ink/40">{formatPoints(points)}</span>
          </button>
        );
      })}
    </div>
  );
}
