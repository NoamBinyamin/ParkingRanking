"use client";

import { useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type LiveReportEvent = {
  zone_name: string;
  zone_icon: string;
  points_awarded: number;
  username: string;
  avatar_emoji: string;
  user_id: string;
};

/** Subscribes to the "someone just reported X" broadcast, skipping the current user's own reports (they already get the confirmation modal). */
export function useLiveReportFeed(
  currentUserId: string | null | undefined,
  onReport: (event: LiveReportEvent) => void
) {
  const onReportRef = useRef(onReport);
  onReportRef.current = onReport;

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("public-reports")
      .on("broadcast", { event: "new_report" }, (message) => {
        const payload = message.payload as LiveReportEvent;
        if (payload.user_id === currentUserId) return;
        onReportRef.current(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);
}
