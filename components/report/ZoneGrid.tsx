import type { Zone } from "@/lib/types/database";
import { ZoneCard } from "@/components/report/ZoneCard";

export function ZoneGrid({
  zones,
  selectedZoneId,
  onSelect,
}: {
  zones: Zone[];
  selectedZoneId: string | null;
  onSelect: (zoneId: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {zones.map((zone) => (
        <ZoneCard
          key={zone.id}
          zone={zone}
          isSelected={zone.id === selectedZoneId}
          onSelect={() => onSelect(zone.id)}
        />
      ))}
    </div>
  );
}
