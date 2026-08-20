import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl border-2 border-ink/10 bg-surface p-6 shadow-[0_8px_0_0_rgba(0,0,0,0.08)]",
        className
      )}
    >
      {children}
    </div>
  );
}
