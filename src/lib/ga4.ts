import "server-only";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

export interface TrafficSummary {
  sessions: number;
  pageViews: number;
  activeUsers: number;
}

function getClient(): BetaAnalyticsDataClient {
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA4_CLIENT_EMAIL,
      // Env vars can't hold literal newlines — the key is stored with \n
      // escape sequences and needs unescaping before use.
      private_key: process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
  });
}

/**
 * Pulls sessions/pageviews/active-users for the trailing N days from the
 * landing site's GA4 property (G-WJECR4TRKT), via a Viewer-scoped service
 * account. Property Access Management in GA4 must have that service
 * account's email added as a Viewer, or this throws a permission error.
 */
export async function getTrafficSummary(days: 7 | 30): Promise<TrafficSummary> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    throw new Error("GA4_PROPERTY_ID is not configured.");
  }

  const client = getClient();
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    metrics: [{ name: "sessions" }, { name: "screenPageViews" }, { name: "activeUsers" }],
  });

  const row = response.rows?.[0];
  const values = row?.metricValues ?? [];

  return {
    sessions: Number(values[0]?.value ?? 0),
    pageViews: Number(values[1]?.value ?? 0),
    activeUsers: Number(values[2]?.value ?? 0),
  };
}

export interface DailyTraffic {
  date: string; // "YYYY-MM-DD"
  sessions: number;
  pageViews: number;
}

/** Day-by-day breakdown for the trailing N days, for charting. GA4 returns
 * dates as "YYYYMMDD" strings — reformatted here to "YYYY-MM-DD". Missing
 * days (no traffic) are filled with zeros so the chart has a continuous
 * x-axis rather than gaps. */
export async function getDailyTraffic(days: 7 | 30): Promise<DailyTraffic[]> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    throw new Error("GA4_PROPERTY_ID is not configured.");
  }

  const client = getClient();
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "sessions" }, { name: "screenPageViews" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  });

  const byDate = new Map<string, { sessions: number; pageViews: number }>();
  for (const row of response.rows ?? []) {
    const raw = row.dimensionValues?.[0]?.value ?? "";
    const formatted = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
    byDate.set(formatted, {
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
      pageViews: Number(row.metricValues?.[1]?.value ?? 0),
    });
  }

  // Fill every day in the range, even ones GA4 omitted (zero traffic).
  const result: DailyTraffic[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = byDate.get(key);
    result.push({ date: key, sessions: entry?.sessions ?? 0, pageViews: entry?.pageViews ?? 0 });
  }

  return result;
}
