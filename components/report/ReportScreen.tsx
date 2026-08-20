"use client";

import { useEffect, useState } from "react";
import type { ReportType, ReportWithZone, Zone } from "@/lib/types/database";
import type { AchievementDefinition } from "@/lib/achievements";
import { ZoneGrid } from "@/components/report/ZoneGrid";
import { ReportConfirmation } from "@/components/report/ReportConfirmation";
import { ReportTypeToggle } from "@/components/report/ReportTypeToggle";
import { CarDrivingIndicator } from "@/components/report/CarDrivingIndicator";
import { RightNowCard } from "@/components/report/RightNowCard";
import { PoopRain } from "@/components/report/PoopRain";
import { RecentReportDialog } from "@/components/report/RecentReportDialog";
import { WelcomeSplash } from "@/components/onboarding/WelcomeSplash";
import { Button } from "@/components/ui/Button";
import { ScreenLoading } from "@/components/ui/ScreenLoading";
import { SAW_BONUS_POINTS } from "@/lib/reportTypes";
import { useCurrentUserId } from "@/lib/hooks/useCurrentUser";
import { useZones } from "@/lib/hooks/useZones";
import { useZoneTimeStats } from "@/lib/hooks/useLeaderboard";
import { useOptimisticScore } from "@/lib/hooks/useProfile";
import { useRevalidateAfterReport } from "@/lib/hooks/useRevalidateAfterReport";
import { submitParkingReport, replaceLastReport } from "@/app/(app)/report/actions";

const GAG_ZONE_SLUG = "sachla";
const ONBOARDING_STORAGE_KEY = "parkpoints_onboarding_seen";

export function ReportScreen() {
  // No server-fetched props at all: the page route does zero data work,
  // so switching to this screen never waits on a server round-trip. The
  // very first time this mounts in a session there's a brief loading
  // state below; every navigation after that reads straight from SWR's
  // cache (instant), which keeps quietly revalidating in the background.
  const currentUserId = useCurrentUserId();
  const { data: zones } = useZones();
  const { data: zoneTimeStats } = useZoneTimeStats();
  const addPoints = useOptimisticScore(currentUserId);
  const revalidateAfterReport = useRevalidateAfterReport();

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [reportType, setReportType] = useState<ReportType>("parked");
  const [spotCount, setSpotCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ zone: Zone; reportType: ReportType; spotCount: number; points: number } | null>(
    null
  );
  const [newlyUnlocked, setNewlyUnlocked] = useState<AchievementDefinition[]>([]);
  const [showPoopRain, setShowPoopRain] = useState(false);
  const [tooSoon, setTooSoon] = useState<{ lastReport: ReportWithZone; minutesRemaining: number } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_STORAGE_KEY)) {
      setShowOnboarding(true);
    }
  }, []);

  function closeOnboarding() {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
  }

  if (!zones || !zoneTimeStats) {
    return <ScreenLoading />;
  }

  const selectedZone = zones.find((z) => z.id === selectedZoneId) ?? null;

  function finishReport(zone: Zone, type: ReportType, count: number, points: number) {
    setConfirmed({ zone, reportType: type, spotCount: count, points });
    setSelectedZoneId(null);
    setReportType("parked");
    setSpotCount(1);
    if (zone.slug === GAG_ZONE_SLUG && type === "parked") {
      setShowPoopRain(true);
    }
  }

  async function handleSubmit() {
    if (!selectedZone) return;
    setIsSubmitting(true);
    try {
      const result = await submitParkingReport(selectedZone.id, reportType, spotCount);
      if (result.status === "too-soon") {
        setTooSoon({ lastReport: result.lastReport, minutesRemaining: result.minutesRemaining });
        return;
      }
      addPoints(result.report.points_awarded);
      revalidateAfterReport();
      setNewlyUnlocked(result.newlyUnlocked);
      finishReport(selectedZone, reportType, spotCount, result.report.points_awarded);
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
      const updated = await replaceLastReport(selectedZone.id);
      addPoints(updated.points_awarded - tooSoon.lastReport.points_awarded);
      revalidateAfterReport();
      setNewlyUnlocked([]);
      setTooSoon(null);
      finishReport(selectedZone, updated.report_type, updated.spot_count, updated.points_awarded);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col pb-2 pt-1">
      <div className="relative mb-2 text-center">
        <button
          onClick={() => setShowOnboarding(true)}
          aria-label="איך משחקים"
          className="absolute end-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-ink/5 text-base text-ink/50 hover:bg-ink/10"
        >
          ℹ️
        </button>
        <h1 className="font-display text-xl font-bold text-ink">איפה חנית?</h1>
        <p className="text-xs text-ink/50">בחרו אזור ונעלו את הניקוד</p>
      </div>

      <ReportTypeToggle
        reportType={reportType}
        spotCount={spotCount}
        onChangeType={setReportType}
        onChangeCount={setSpotCount}
      />

      <div className="mb-3">
        <RightNowCard zones={zones} stats={zoneTimeStats} />
      </div>

      <ZoneGrid
        zones={zones}
        selectedZoneId={selectedZoneId}
        onSelect={setSelectedZoneId}
        displayPoints={reportType === "saw" ? SAW_BONUS_POINTS : undefined}
      />

      <div className="mt-auto pt-4">
        <Button
          variant="primary"
          className="w-full py-4 text-lg shadow-[0_8px_0_0_var(--color-game-purple-dark)]"
          disabled={!selectedZone}
          isLoading={isSubmitting}
          loadingContent={<CarDrivingIndicator />}
          pulse={Boolean(selectedZone)}
          onClick={handleSubmit}
        >
          {selectedZone
            ? reportType === "saw"
              ? `דיווח שראיתי מקום ב${selectedZone.name} 👀`
              : `דיווח על ${selectedZone.name} 🚀`
            : "בחרו אזור"}
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

      {confirmed && (
        <ReportConfirmation
          zone={confirmed.zone}
          reportType={confirmed.reportType}
          spotCount={confirmed.spotCount}
          pointsAwarded={confirmed.points}
          newlyUnlocked={newlyUnlocked}
          onClose={() => {
            setConfirmed(null);
            setNewlyUnlocked([]);
          }}
        />
      )}
    </div>
  );
}
