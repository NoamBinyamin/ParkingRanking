import { Card } from "@/components/ui/Card";
import { PointsBadge } from "@/components/ui/PointsBadge";
import { formatReportTime } from "@/lib/utils/time";
import type { ReportWithZone } from "@/lib/types/database";

export function RecentReportsList({ reports }: { reports: ReportWithZone[] }) {
  if (reports.length === 0) {
    return (
      <Card className="text-center text-sm text-ink/50">עוד לא דיווחתם על אף חניה 🚗</Card>
    );
  }

  return (
    <Card className="divide-y divide-ink/5">
      {reports.map((report) => {
        const isSighting = report.report_type === "saw";
        return (
          <div key={report.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="text-2xl">{isSighting ? "👀" : report.zone.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-semibold text-ink">
                {report.zone.name}
                {isSighting && (
                  <span className="ms-1 text-xs font-normal text-ink/40">
                    (ראיתי {report.spot_count > 1 ? `${report.spot_count} מקומות` : "מקום"})
                  </span>
                )}
              </p>
              <p className="text-xs text-ink/40" dir="ltr">
                {formatReportTime(report.created_at)}
              </p>
            </div>
            <PointsBadge value={report.points_awarded} size="sm" />
          </div>
        );
      })}
    </Card>
  );
}
