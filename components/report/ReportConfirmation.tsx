"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import type { Zone } from "@/lib/types/database";
import type { AchievementDefinition } from "@/lib/achievements";
import { formatPoints, isPositive } from "@/lib/utils/points";
import { Button } from "@/components/ui/Button";

const JACKPOT_THRESHOLD = 50;

export function ReportConfirmation({
  zone,
  newlyUnlocked = [],
  onClose,
}: {
  zone: Zone;
  newlyUnlocked?: AchievementDefinition[];
  onClose: () => void;
}) {
  const positive = isPositive(zone.point_value);
  const isJackpot = zone.point_value >= JACKPOT_THRESHOLD;
  const hasUnlocks = newlyUnlocked.length > 0;

  useEffect(() => {
    if (positive) {
      confetti({
        particleCount: isJackpot ? 160 : 80,
        spread: isJackpot ? 100 : 70,
        origin: { y: 0.6 },
        colors: ["#7c5cff", "#ff5da2", "#ffc93c", "#33d17a"],
      });
    }
  }, [positive, isJackpot]);

  useEffect(() => {
    if (hasUnlocks) {
      const timeout = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.4 },
          colors: ["#ffc93c", "#f0a500"],
        });
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [hasUnlocks]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-20 flex items-center justify-center bg-ink/40 p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-xs rounded-3xl border-2 bg-surface p-6 text-center ${
            positive ? "border-game-green" : "border-game-red animate-shake"
          }`}
        >
          {positive ? (
            <motion.div
              className="mb-2 text-5xl"
              initial={{ x: 140, opacity: 0 }}
              animate={{ x: [140, -12, 4, 0], opacity: 1 }}
              transition={{ duration: 0.7, times: [0, 0.65, 0.85, 1], ease: "easeOut" }}
              aria-hidden
            >
              {zone.icon}
            </motion.div>
          ) : (
            <motion.div
              className="mb-2 text-5xl"
              initial={{ y: -60, opacity: 0, rotate: -8 }}
              animate={{ y: [-60, 6, -3, 0], opacity: 1, rotate: [-8, 4, 0] }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              aria-hidden
            >
              {zone.icon}
            </motion.div>
          )}
          <p className="font-display text-lg font-bold text-ink">{zone.name}</p>
          <p
            className={`mt-2 font-display text-4xl font-extrabold ${
              positive ? "text-game-green-dark" : "text-game-red-dark"
            }`}
          >
            {formatPoints(zone.point_value)}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink/60">{zone.description}</p>

          {hasUnlocks && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
              className="mt-4 space-y-2 rounded-2xl border-2 border-game-yellow-dark bg-game-yellow/20 p-3"
            >
              <p className="font-display text-xs font-bold text-game-yellow-dark">תג חדש נפתח! 🎖️</p>
              {newlyUnlocked.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-2 text-start">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <p className="font-display text-sm font-bold text-ink">{achievement.name}</p>
                    <p className="text-xs text-ink/50">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          <Button variant={positive ? "primary" : "ghost"} className="mt-6 w-full" onClick={onClose}>
            הבנתי!
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
