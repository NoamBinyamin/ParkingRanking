"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getZoneMapImage } from "@/lib/reportTypes";
import type { Zone } from "@/lib/types/database";

export function ZoneMap({ selectedZone }: { selectedZone: Zone | null }) {
  const highlightSrc = selectedZone ? getZoneMapImage(selectedZone.slug) : null;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-ink/10 bg-ink/5">
      <img src="/maps/clean.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <AnimatePresence>
        {highlightSrc && (
          <motion.img
            key={highlightSrc}
            src={highlightSrc}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
