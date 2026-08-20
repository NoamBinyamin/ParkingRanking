/** Appends an alpha channel to a 6-digit hex color, e.g. hexWithAlpha("#7c5cff", 0.5). */
export function hexWithAlpha(hex: string, alpha: number): string {
  const clamped = Math.max(0, Math.min(1, alpha));
  const alphaHex = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${alphaHex}`;
}
