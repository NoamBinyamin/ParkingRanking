"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        // Cache is shared across every screen for the lifetime of the app
        // session (not per-route), so navigating back to a screen you've
        // already visited paints instantly from cache while this
        // revalidates it in the background -- stale-while-revalidate.
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
