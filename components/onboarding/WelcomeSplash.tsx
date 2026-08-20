"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ONBOARDING_STEPS } from "@/lib/onboarding";

export function WelcomeSplash({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-30 flex items-center justify-center bg-ink/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[85vh] w-full max-w-md overflow-y-auto"
        >
          <Card className="text-center">
            <div className="mb-1 text-5xl animate-float">🕹️</div>
            <h1 className="font-display text-xl font-bold text-ink">
              ברוכים הבאים למשחק החניה שישדרג לכם את ההגה!
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink/60">
              הגעתם, דוממתם מנוע? הגיע הזמן לשחק! האפליקציה הופכת את חיפוש החניה שלכם לתחרות על נקודות ותהילה.
              ככה זה עובד:
            </p>

            <div className="mt-5 space-y-4 text-start">
              {ONBOARDING_STEPS.map((step) => (
                <div key={step.title} className="flex gap-3">
                  <span className="text-2xl">{step.icon}</span>
                  <div>
                    <p className="font-display text-sm font-bold text-ink">{step.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink/60">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-5 font-display text-sm font-bold text-game-purple-dark">
              מוכנים? תתניעו, חנו, ודווחו! 🏁
            </p>

            <Button variant="primary" className="mt-5 w-full" onClick={onClose}>
              בואו נתחיל! 🚀
            </Button>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
