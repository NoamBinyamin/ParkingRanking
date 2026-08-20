"use client";

import { mutate } from "swr";

/** Refreshes everything a new/edited report can affect, in the background -- callers don't wait on this. */
export function useRevalidateAfterReport() {
  return function revalidateAfterReport() {
    mutate((key) => Array.isArray(key) && key[0] === "leaderboard");
    mutate((key) => Array.isArray(key) && key[0] === "achievements");
    mutate((key) => Array.isArray(key) && key[0] === "achievement-progress");
    mutate((key) => Array.isArray(key) && key[0] === "recent-reports");
    mutate("zone-time-stats");
  };
}
