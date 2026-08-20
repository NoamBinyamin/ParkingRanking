"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReportWithZone, Zone } from "@/lib/types/database";
import { Button } from "@/components/ui/Button";

export function RecentReportDialog({
  lastReport,
  newZone,
  minutesRemaining,
  isSubmitting,
  onConfirm,
  onCancel,
}: {
  lastReport: ReportWithZone;
  newZone: Zone;
  minutesRemaining: number;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-20 flex items-center justify-center bg-ink/40 p-6"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xs rounded-3xl border-2 border-game-purple bg-white p-6 text-center"
        >
          <div className="mb-2 text-4xl">🕒</div>
          <p className="font-display text-lg font-bold text-ink">רגע, כבר דיווחתם!</p>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">
            דיווחתם על {lastReport.zone.icon} {lastReport.zone.name} לפני פחות מ-15 דקות. אפשר לדווח שוב רק
            כעבור כ-{minutesRemaining} דקות נוספות.
          </p>
          <p className="mt-3 text-sm font-semibold text-ink">
            רוצים לעדכן את הדיווח האחרון ל-{newZone.icon} {newZone.name} במקום?
          </p>
          <div className="mt-6 flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={onCancel} disabled={isSubmitting}>
              לא, תודה
            </Button>
            <Button variant="primary" className="flex-1" onClick={onConfirm} isLoading={isSubmitting}>
              כן, עדכנו
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
