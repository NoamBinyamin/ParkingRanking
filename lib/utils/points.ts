export function formatPoints(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

export function isPositive(value: number): boolean {
  return value >= 0;
}
