import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTrafficSummary } from "@/lib/ga4";
import { isPreviewMode } from "@/lib/preview-mode";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store, Megaphone } from "lucide-react";
import { CreatePostDialog } from "./moderation/create-post-dialog";

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
      {/* Header with Direct Posting Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Community overview and quick actions.</p>
        </div>
        <div className="flex items-center gap-2">
          <CreatePostDialog />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active councillors" value={councillors} href="/councillors" />
        <StatCard label="Pending invites" value={pendingInvites} href="/councillors" />
        <StatCard label="Sessions (7 days)" value={sessions} href="/analytics" />
      </div>

      {/* Quick Publishing & Shortcuts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Publish &amp; Community Actions</CardTitle>
          <CardDescription>
            Direct publishing shortcuts for admins to post updates and manage listings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-foreground">Community Post</div>
                <div className="text-xs text-muted-foreground">Post news or event to mobile feed</div>
              </div>
              <div className="shrink-0 ml-2">
                <CreatePostDialog />
              </div>
            </div>

            <Link
              href="/listings"
              className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors group"
            >
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-foreground group-hover:text-primary">
                  Add Business Listing
                </div>
                <div className="text-xs text-muted-foreground">Directory &amp; Love Local specials</div>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                <Store className="size-4" />
              </div>
            </Link>

            <Link
              href="/ward-updates"
              className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors group"
            >
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-foreground group-hover:text-primary">
                  Ward Update Broadcast
                </div>
                <div className="text-xs text-muted-foreground">Official councillor announcements</div>
              </div>
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <Megaphone className="size-4" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
