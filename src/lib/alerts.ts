import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPreviewMode } from "@/lib/preview-mode";

export interface AdminAlert {
  id: string;
  type: "moderation" | "registration" | "report";
  title: string;
  description: string;
  href: string;
  timeAgo: string;
}

export async function getAdminAlerts(): Promise<{ alerts: AdminAlert[]; count: number }> {
  if (isPreviewMode) {
    return {
      alerts: [
        {
          id: "preview-alert-1",
          type: "moderation",
          title: "New post pending approval",
          description: "Linden Spring Clean-up Day (Neighbourhood)",
          href: "/moderation",
          timeAgo: "10m ago",
        },
        {
          id: "preview-alert-2",
          type: "registration",
          title: "New business registration",
          description: "Satori Pizza expressed partner interest",
          href: "/registrations",
          timeAgo: "1h ago",
        },
      ],
      count: 2,
    };
  }

  try {
    const admin = createAdminClient();

    const [posts, reports, registrations] = await Promise.all([
      admin
        .from("community_posts")
        .select("id, title, category, created_at")
        .eq("moderation_status", "pending")
        .order("created_at", { ascending: false })
        .limit(3),
      admin
        .from("reports")
        .select("id, reason, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(3),
      admin
        .from("registrations")
        .select("id, full_name, first_name, last_name, email, created_at")
        .is("claimed_at", null)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    const alerts: AdminAlert[] = [];

    (posts.data || []).forEach((p) => {
      alerts.push({
        id: `post-${p.id}`,
        type: "moderation",
        title: "Post pending review",
        description: p.title || "Community post",
        href: "/moderation",
        timeAgo: "Pending",
      });
    });

    (reports.data || []).forEach((r) => {
      alerts.push({
        id: `report-${r.id}`,
        type: "report",
        title: "Flagged content report",
        description: r.reason || "Content flagged by user",
        href: "/moderation",
        timeAgo: "Action required",
      });
    });

    (registrations.data || []).forEach((reg) => {
      const name = reg.full_name || [reg.first_name, reg.last_name].filter(Boolean).join(" ") || reg.email;
      alerts.push({
        id: `reg-${reg.id}`,
        type: "registration",
        title: "New registration",
        description: `${name} registered on landing page`,
        href: "/registrations",
        timeAgo: "Unclaimed",
      });
    });

    return {
      alerts,
      count: alerts.length,
    };
  } catch (err) {
    console.error("Failed to load admin alerts:", err);
    return { alerts: [], count: 0 };
  }
}
