import { getTrafficSummary, getDailyTraffic, type TrafficSummary, type DailyTraffic } from "@/lib/ga4";
import { isPreviewMode } from "@/lib/preview-mode";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { TrafficChart } from "./traffic-chart";

const SAMPLE_SUMMARY: TrafficSummary = { sessions: 412, pageViews: 1180, activeUsers: 287 };
const SAMPLE_DAILY: DailyTraffic[] = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return { date: d.toISOString().slice(0, 10), sessions: 40 + i * 6, pageViews: 120 + i * 15 };
});

interface Props {
  searchParams: Promise<{ range?: string }>;
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const { range } = await searchParams;
  const days = range === "30" ? 30 : 7;

  let summary: TrafficSummary;
  let daily: DailyTraffic[];
  let error: string | null = null;

  if (isPreviewMode) {
    summary = SAMPLE_SUMMARY;
    daily = SAMPLE_DAILY;
  } else {
    try {
      [summary, daily] = await Promise.all([getTrafficSummary(days), getDailyTraffic(days)]);
    } catch (e) {
      summary = { sessions: 0, pageViews: 0, activeUsers: 0 };
      daily = [];
      error = e instanceof Error ? e.message : "Couldn't load traffic data.";
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Website traffic</h1>
          <p className="text-sm text-muted-foreground">hellohyperlocal.co.za, via Google Analytics.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <a
            href="?range=7"
            className={days === 7 ? "font-semibold text-foreground" : "text-muted-foreground hover:underline"}
          >
            7 days
          </a>
          <span className="text-muted-foreground">·</span>
          <a
            href="?range=30"
            className={days === 30 ? "font-semibold text-foreground" : "text-muted-foreground hover:underline"}
          >
            30 days
          </a>
        </div>
      </div>

      {error && (
        <Card className="px-4 text-sm text-destructive">
          Couldn&apos;t load traffic data: {error}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Sessions" value={summary.sessions} />
        <StatCard label="Page views" value={summary.pageViews} />
        <StatCard label="Active users" value={summary.activeUsers} />
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Sessions &amp; page views over time</h2>
        <TrafficChart data={daily} />
      </Card>
    </div>
  );
}
