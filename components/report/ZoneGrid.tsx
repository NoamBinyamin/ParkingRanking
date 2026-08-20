import type { Zone } from "@/lib/types/database";
import { ZoneCard } from "@/components/report/ZoneCard";

export function ZoneGrid({
  zones,
  selectedZoneId,
  onSelect,
  displayPoints,
}: {
  zones: Zone[];
  selectedZoneId: string | null;
  onSelect: (zoneId: string) => void;
  /** Overrides every card's badge -- e.g. the flat "saw" bonus instead of each zone's own point_value. */
  displayPoints?: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {zones.map((zone) => (
        <ZoneCard
          key={zone.id}
          zone={zone}
          isSelected={zone.id === selectedZoneId}
          onSelect={() => onSelect(zone.id)}
          displayPoints={displayPoints}
        />
      ))}
    </div>
  );
}
