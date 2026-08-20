"use client";

import type { ReportType } from "@/lib/types/database";
import { MAX_SPOT_COUNT, REPORT_TYPE_LABELS, SAW_BONUS_POINTS } from "@/lib/reportTypes";

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
    <div className="mb-3">
      <div className="flex rounded-2xl bg-ink/5 p-1">
        {(Object.keys(REPORT_TYPE_LABELS) as ReportType[]).map((type) => (
          <button
            key={type}
            onClick={() => onChangeType(type)}
            className={`flex-1 rounded-xl py-2 text-sm font-display font-semibold transition-colors ${
              reportType === type ? "bg-surface text-game-purple-dark shadow" : "text-ink/50"
            }`}
          >
            {REPORT_TYPE_LABELS[type].icon} {REPORT_TYPE_LABELS[type].label}
          </button>
        ))}
      </div>

      {reportType === "saw" && (
        <div className="mt-2 rounded-2xl border-2 border-game-blue/30 bg-game-blue/10 p-3">
          <p className="mb-2 text-xs leading-relaxed text-ink/60">
            לא חניתם בעצמכם? עדיין אפשר לעזור! דיווח על מקום פנוי שראיתם משפר את ההמלצות לכולם, ותמיד שווה{" "}
            {SAW_BONUS_POINTS} נק&apos; בונוס 🙌
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs font-semibold text-ink/60">כמה מקומות ראיתם?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onChangeCount(Math.max(1, spotCount - 1))}
                aria-label="פחות מקומות"
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink/10 bg-surface font-display text-lg font-bold text-ink"
              >
                −
              </button>
              <span className="w-6 text-center font-display text-lg font-bold text-ink">{spotCount}</span>
              <button
                onClick={() => onChangeCount(Math.min(MAX_SPOT_COUNT, spotCount + 1))}
                aria-label="יותר מקומות"
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink/10 bg-surface font-display text-lg font-bold text-ink"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
