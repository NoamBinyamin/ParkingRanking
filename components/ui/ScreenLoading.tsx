"use client";

import { motion } from "framer-motion";

export function ScreenLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <motion.span
        className="text-5xl"
        animate={{ x: ["-10%", "10%", "-10%"] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        🚗
      </motion.span>
      <p className="font-display text-sm font-semibold text-ink/40">טוען…</p>
    </div>
  );
}
