"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-game-purple text-white border-game-purple-dark shadow-[0_6px_0_0_var(--color-game-purple-dark)]",
  secondary: "bg-game-yellow text-ink border-game-yellow-dark shadow-[0_6px_0_0_var(--color-game-yellow-dark)]",
  danger: "bg-game-red text-white border-game-red-dark shadow-[0_6px_0_0_var(--color-game-red-dark)]",
  ghost: "bg-white text-ink border-ink/10 shadow-[0_6px_0_0_rgba(36,31,61,0.08)]",
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
}) {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={isDisabled ? undefined : { scale: 0.94, y: 4 }}
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
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
