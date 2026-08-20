"use client";

import { useEffect, useState } from "react";
import type { ReportWithZone, Zone, ZoneTimeStat } from "@/lib/types/database";
import type { AchievementDefinition } from "@/lib/achievements";
import { ZoneGrid } from "@/components/report/ZoneGrid";
import { ReportConfirmation } from "@/components/report/ReportConfirmation";
import { CarDrivingIndicator } from "@/components/report/CarDrivingIndicator";
import { RightNowCard } from "@/components/report/RightNowCard";
import { PoopRain } from "@/components/report/PoopRain";
import { RecentReportDialog } from "@/components/report/RecentReportDialog";
import { WelcomeSplash } from "@/components/onboarding/WelcomeSplash";
import { Button } from "@/components/ui/Button";
import { useUserStore } from "@/lib/stores/useUserStore";
import { submitParkingReport, replaceLastReport } from "@/app/(app)/report/actions";

const GAG_ZONE_SLUG = "sachla";
const ONBOARDING_STORAGE_KEY = "parkpoints_onboarding_seen";

export function ReportScreen({ zones, zoneTimeStats }: { zones: Zone[]; zoneTimeStats: ZoneTimeStat[] }) {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedZone, setConfirmedZone] = useState<Zone | null>(null);
  const [newlyUnlocked, setNewlyUnlocked] = useState<AchievementDefinition[]>([]);
  const [showPoopRain, setShowPoopRain] = useState(false);
  const [tooSoon, setTooSoon] = useState<{ lastReport: ReportWithZone; minutesRemaining: number } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const addPoints = useUserStore((s) => s.addPoints);

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_STORAGE_KEY)) {
      setShowOnboarding(true);
    }
  }, []);

  function closeOnboarding() {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
  }

  const selectedZone = zones.find((z) => z.id === selectedZoneId) ?? null;

  function finishReport(zone: Zone) {
    setConfirmedZone(zone);
    setSelectedZoneId(null);
    if (zone.slug === GAG_ZONE_SLUG) {
      setShowPoopRain(true);
    }
  }

  async function handleSubmit() {
    if (!selectedZone) return;
    setIsSubmitting(true);
    try {
      const result = await submitParkingReport(selectedZone.id);
      if (result.status === "too-soon") {
        setTooSoon({ lastReport: result.lastReport, minutesRemaining: result.minutesRemaining });
        return;
      }
      addPoints(selectedZone.point_value);
      setNewlyUnlocked(result.newlyUnlocked);
      finishReport(selectedZone);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmReplace() {
    if (!tooSoon || !selectedZone) return;
    setIsSubmitting(true);
    try {
      await replaceLastReport(selectedZone.id);
      addPoints(selectedZone.point_value - tooSoon.lastReport.points_awarded);
      setNewlyUnlocked([]);
      setTooSoon(null);
      finishReport(selectedZone);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="pb-6 pt-2">
      <div className="relative mb-4 text-center">
        <button
          onClick={() => setShowOnboarding(true)}
          aria-label="איך משחקים"
          className="absolute end-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-lg text-ink/50 hover:bg-ink/10"
        >
          ℹ️
        </button>
        <h1 className="font-display text-2xl font-bold text-ink">איפה חנית?</h1>
        <p className="text-sm text-ink/50">בחרו אזור ונעלו את הניקוד</p>
      </div>

      <div className="mb-4">
        <RightNowCard zones={zones} stats={zoneTimeStats} />
      </div>

      <ZoneGrid zones={zones} selectedZoneId={selectedZoneId} onSelect={setSelectedZoneId} />

      <div className="sticky bottom-24 mt-6">
        <Button
          variant="primary"
          className="w-full"
          disabled={!selectedZone}
          isLoading={isSubmitting}
          loadingContent={<CarDrivingIndicator />}
          onClick={handleSubmit}
        >
          {selectedZone ? `דיווח על ${selectedZone.name} 🚀` : "בחרו אזור"}
        </Button>
      </div>

      {showPoopRain && <PoopRain onDone={() => setShowPoopRain(false)} />}

      {showOnboarding && <WelcomeSplash onClose={closeOnboarding} />}

      {tooSoon && selectedZone && (
        <RecentReportDialog
          lastReport={tooSoon.lastReport}
          newZone={selectedZone}
          minutesRemaining={tooSoon.minutesRemaining}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmReplace}
          onCancel={() => setTooSoon(null)}
        />
      )}

      {confirmedZone && (
        <ReportConfirmation
          zone={confirmedZone}
          newlyUnlocked={newlyUnlocked}
          onClose={() => {
            setConfirmedZone(null);
            setNewlyUnlocked([]);
          }}
        />
      )}
    </div>
  );
}
