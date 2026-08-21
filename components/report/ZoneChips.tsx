"use client";

import { PointsBadge } from "@/components/ui/PointsBadge";
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
    <div className="grid grid-cols-3 gap-1">
      {zones.map((zone) => {
        const isSelected = zone.id === selectedZoneId;
        const points = displayPoints ?? zone.point_value;

        return (
          <button
            key={zone.id}
            onClick={() => onSelect(zone.id)}
            style={
              isSelected
                ? { borderColor: zone.color, backgroundColor: hexWithAlpha(zone.color, 0.12) }
                : undefined
            }
            className={`flex flex-col items-center gap-0.5 rounded-xl border p-1.5 text-center transition-colors ${
              isSelected ? "text-ink" : "border-ink/10 bg-surface text-ink/70"
            }`}
          >
            <span className="text-xl leading-none">{zone.icon}</span>
            <span className="w-full truncate font-display text-xs font-semibold leading-tight">
              {zone.name}
            </span>
            <PointsBadge value={points} size="sm" />
          </button>
        );
      })}
    </div>
  );
}
