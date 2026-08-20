"use client";

import { motion } from "framer-motion";

/** A small car driving back and forth over a dashed road, used as a submit-button loading state. */
export function CarDrivingIndicator() {
  return (
    <span className="relative inline-flex h-6 w-28 items-center justify-center overflow-hidden" aria-hidden>
      <span className="absolute inset-x-1 border-t-2 border-dashed border-current opacity-40" />
      <motion.span
        className="relative text-xl"
        animate={{ x: ["35%", "-135%", "35%"] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
      >
        🚗
      </motion.span>
    </span>
  );
}
