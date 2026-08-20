"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-game-purple text-white border-game-purple-dark shadow-[0_6px_0_0_var(--color-game-purple-dark)]",
  // Fixed dark text (not text-ink) -- this sits on a bright yellow
  // background regardless of theme, so it must never flip to light text.
  secondary: "bg-game-yellow text-[#241f3d] border-game-yellow-dark shadow-[0_6px_0_0_var(--color-game-yellow-dark)]",
  danger: "bg-game-red text-white border-game-red-dark shadow-[0_6px_0_0_var(--color-game-red-dark)]",
  ghost: "bg-surface text-ink border-ink/10 shadow-[0_6px_0_0_rgba(0,0,0,0.1)]",
};

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  isLoading = false,
  disabled = false,
  className,
  loadingContent,
  pulse = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: ButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  /** Overrides the default "טוען…" text while isLoading is true. */
  loadingContent?: ReactNode;
  /** Gentle continuous breathing animation, to draw the eye once the button becomes actionable. */
  pulse?: boolean;
}) {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      animate={pulse && !isDisabled ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={
        pulse && !isDisabled
          ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
          : { type: "spring", stiffness: 500, damping: 25 }
      }
      // whileTap/whileHover carry their own transition so the slow pulse
      // loop above never leaks into gesture feedback, which needs to
      // stay snappy regardless of whether the button is pulsing.
      whileTap={
        isDisabled ? undefined : { scale: 0.94, y: 4, transition: { type: "spring", stiffness: 500, damping: 25 } }
      }
      whileHover={
        isDisabled ? undefined : { scale: 1.02, transition: { type: "spring", stiffness: 500, damping: 25 } }
      }
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl border-2 px-6 py-3",
        "font-display text-base font-semibold tracking-wide",
        "disabled:opacity-50 disabled:pointer-events-none",
        VARIANT_STYLES[variant],
        className
      )}
    >
      {isLoading ? (loadingContent ?? "טוען…") : children}
    </motion.button>
  );
}
