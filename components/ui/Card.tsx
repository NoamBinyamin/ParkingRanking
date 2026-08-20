import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-ink/8 bg-surface p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_6px_16px_-4px_rgba(16,24,40,0.08)]",
        className
      )}
    >
      {children}
    </div>
  );
}
