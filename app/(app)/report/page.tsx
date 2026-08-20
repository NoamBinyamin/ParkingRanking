import { ReportScreen } from "@/components/report/ReportScreen";

// No server-side data fetching here on purpose: this route does zero
// async work, so navigating to it never waits on a server round-trip --
// all data comes from the client-side SWR cache in ReportScreen.
export default function ReportPage() {
  return <ReportScreen />;
}
