import { cn } from "@/lib/utils/cn";
import { formatPoints, isPositive } from "@/lib/utils/points";

export function PointsBadge({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md" | "lg";
}) {
  const positive = isPositive(value);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-display font-bold",
        positive ? "bg-game-green/15 text-game-green-dark" : "bg-game-red/15 text-game-red-dark",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-1.5 text-lg"
      )}
    >
      {formatPoints(value)} נק&apos;
    </span>
  );
}
