"use client";

import type { ReportType } from "@/lib/types/database";
import { MAX_SPOT_COUNT, REPORT_TYPE_LABELS } from "@/lib/reportTypes";

export function ReportTypeToggle({
  reportType,
  spotCount,
  onChangeType,
  onChangeCount,
}: {
  reportType: ReportType;
  spotCount: number;
  onChangeType: (type: ReportType) => void;
  onChangeCount: (count: number) => void;
}) {
  return (
    <div className="mb-1">
      <div className="flex rounded-2xl bg-ink/5 p-1">
        {(Object.keys(REPORT_TYPE_LABELS) as ReportType[]).map((type) => (
          <button
            key={type}
            onClick={() => onChangeType(type)}
            className={`flex-1 rounded-xl py-1.5 text-sm font-display font-semibold transition-colors ${
              reportType === type ? "bg-surface text-game-purple-dark shadow" : "text-ink/50"
            }`}
          >
            {REPORT_TYPE_LABELS[type].icon} {REPORT_TYPE_LABELS[type].label}
          </button>
        ))}
      </div>

      {reportType === "saw" && (
        <div className="mt-0 flex items-center justify-center gap-2 rounded-full border border-game-blue/30 bg-game-blue/10 px-2.5 py-0.5">
          <span className="text-[11px] font-semibold text-ink/60">כמה מקומות ראיתם?</span>
          <button
            onClick={() => onChangeCount(Math.max(1, spotCount - 1))}
            aria-label="פחות מקומות"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink/15 bg-surface font-display text-xs font-bold text-ink"
          >
            −
          </button>
          <span className="w-4 text-center font-display text-xs font-bold text-ink">{spotCount}</span>
          <button
            onClick={() => onChangeCount(Math.min(MAX_SPOT_COUNT, spotCount + 1))}
            aria-label="יותר מקומות"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink/15 bg-surface font-display text-xs font-bold text-ink"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
