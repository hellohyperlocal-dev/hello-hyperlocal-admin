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
