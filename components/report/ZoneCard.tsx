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
}: {
  zone: Zone;
  isSelected: boolean;
  onSelect: () => void;
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
        "relative flex flex-col items-center gap-2 rounded-3xl border-2 p-4 text-center transition-colors",
        isSelected
          ? "border-game-purple bg-game-purple/10"
          : "border-ink/10 bg-white hover:border-game-purple/40"
      )}
    >
      {isJackpot && (
        <span className="absolute -top-2 end-2 animate-wiggle text-lg" aria-hidden>
          ✨
        </span>
      )}
      <span className="text-3xl">{zone.icon}</span>
      <span className="font-display text-sm font-semibold leading-tight text-ink">{zone.name}</span>
      <PointsBadge value={zone.point_value} size="sm" />
    </motion.button>
  );
}
