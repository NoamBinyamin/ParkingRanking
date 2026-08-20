"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { PointsBadge } from "@/components/ui/PointsBadge";
import type { Zone } from "@/lib/types/database";

const JACKPOT_THRESHOLD = 50;

export function ZoneCard({
  zone,
  isSelected,
  onSelect,
  displayPoints,
}: {
  zone: Zone;
  isSelected: boolean;
  onSelect: () => void;
  /** Overrides the badge shown -- e.g. the flat "saw" bonus instead of the zone's own point_value. */
  displayPoints?: number;
}) {
  const isJackpot = zone.point_value >= JACKPOT_THRESHOLD;

  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={isSelected ? { boxShadow: `0 0 0 4px ${zone.color}33` } : undefined}
      className={cn(
        "relative flex flex-col items-center gap-1 rounded-2xl border-2 p-2 text-center transition-colors",
        isSelected
          ? "border-game-purple bg-game-purple/10"
          : "border-ink/10 bg-surface hover:border-game-purple/40"
      )}
    >
      {isJackpot && (
        <span className="absolute -top-1.5 end-1.5 animate-wiggle text-base" aria-hidden>
          ✨
        </span>
      )}
      <span className="text-2xl">{zone.icon}</span>
      <span className="font-display text-xs font-semibold leading-tight text-ink">{zone.name}</span>
      <PointsBadge value={displayPoints ?? zone.point_value} size="sm" />
    </motion.button>
  );
}
