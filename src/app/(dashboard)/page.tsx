import { createAdminClient } from "@/lib/supabase/admin";
import { getTrafficSummary } from "@/lib/ga4";
import { isPreviewMode } from "@/lib/preview-mode";
import { StatCard } from "@/components/stat-card";

const SAMPLE = { councillors: 4, pendingInvites: 2, sessions: 412 };

export default async function DashboardHomePage() {
  if (isPreviewMode) {
    return (
      <StatsGrid
        councillors={SAMPLE.councillors}
        pendingInvites={SAMPLE.pendingInvites}
        sessions={SAMPLE.sessions}
      />
    );
  }

  const admin = createAdminClient();

  const [councillorsResult, invitesResult, trafficResult] = await Promise.allSettled([
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "councillor"),
    admin
      .from("invites")
      .select("id", { count: "exact", head: true })
      .is("consumed_at", null)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString()),
    getTrafficSummary(7),
  ]);

  const councillors = councillorsResult.status === "fulfilled" ? (councillorsResult.value.count ?? 0) : 0;
  const pendingInvites = invitesResult.status === "fulfilled" ? (invitesResult.value.count ?? 0) : 0;
  const sessions = trafficResult.status === "fulfilled" ? trafficResult.value.sessions : 0;

  return <StatsGrid councillors={councillors} pendingInvites={pendingInvites} sessions={sessions} />;
}

function StatsGrid({
  councillors,
  pendingInvites,
  sessions,
}: {
  councillors: number;
  pendingInvites: number;
  sessions: number;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">At a glance.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active councillors" value={councillors} href="/councillors" />
        <StatCard label="Pending invites" value={pendingInvites} href="/councillors" />
        <StatCard label="Sessions (7 days)" value={sessions} href="/analytics" />
      </div>
    </div>
  );
}
