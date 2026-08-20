"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LiveReportEvent } from "@/lib/hooks/useLiveReportFeed";
import { formatPoints, isPositive } from "@/lib/utils/points";

export function LiveReportToast({ toast }: { toast: { id: number; event: LiveReportEvent } | null }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed inset-x-4 z-40 mx-auto flex max-w-sm items-center gap-2 rounded-2xl border-2 border-game-purple-dark bg-surface px-4 py-3 shadow-lg"
          style={{ top: "calc(env(safe-area-inset-top) + 0.75rem)" }}
        >
          <span className="text-2xl">{toast.event.avatar_emoji}</span>
          <p className="min-w-0 flex-1 truncate font-display text-sm font-bold text-ink">
            {toast.event.username} דיווח/ה על {toast.event.zone_icon} {toast.event.zone_name}
          </p>
          <span
            className={`shrink-0 font-display text-sm font-bold ${
              isPositive(toast.event.points_awarded) ? "text-game-green-dark" : "text-game-red-dark"
            }`}
          >
            {formatPoints(toast.event.points_awarded)}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
