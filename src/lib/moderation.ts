import { createAdminClient } from "@/lib/supabase/admin";
import type { InboxCategory, InboxItemInput } from "@/components/inbox/types";

export const MODERATION_CATEGORIES = [
  { id: "community_posts", label: "Community Posts", table: "community_posts" as const },
  { id: "marketplace_listings", label: "Marketplace", table: "marketplace_listings" as const },
  { id: "love_local_offers", label: "Love Local", table: "love_local_offers" as const },
  { id: "reports", label: "Reports", table: "reports" as const },
] as const;

export type ModerationTable = "community_posts" | "marketplace_listings" | "love_local_offers";

interface ContentRow {
  id: string;
  author_id: string | null;
  category: string;
  title: string;
  content?: string;
  description?: string;
  image_url: string | null;
  created_at: string;
  moderation_status: string;
  rejection_reason: string | null;
  price?: string;
}

interface ReportRow {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string | null;
  status: string;
  created_at: string;
  community_posts: { title: string; content: string } | null;
}

export interface ModerationDetail {
  kind: "content";
  table: ModerationTable;
  row: ContentRow;
  authorName: string;
}

export interface ReportDetail {
  kind: "report";
  row: ReportRow;
  reporterName?: string;
}

export async function getModerationQueue(): Promise<{
  categories: InboxCategory[];
  items: InboxItemInput[];
  byId: Map<string, ModerationDetail | ReportDetail>;
}> {
  const admin = createAdminClient();

  const [postsResult, marketplaceResult, loveLocalResult, reportsResult] = await Promise.all([
    admin
      .from("community_posts")
      .select("id, author_id, category, title, content, image_url, created_at, moderation_status, rejection_reason")
      .eq("moderation_status", "pending")
      .order("created_at", { ascending: false }),
    admin
      .from("marketplace_listings")
      .select(
        "id, author_id, category, title, description, price, image_url, created_at, moderation_status, rejection_reason"
      )
      .eq("moderation_status", "pending")
      .order("created_at", { ascending: false }),
    admin
      .from("love_local_offers")
      .select(
        "id, author_id, category, title, description, price, image_url, created_at, moderation_status, rejection_reason"
      )
      .eq("moderation_status", "pending")
      .order("created_at", { ascending: false }),
    admin
      .from("reports")
      .select("id, post_id, reporter_id, reason, status, created_at, community_posts(title, content)")
      .eq("status", "open")
      .order("created_at", { ascending: false }),
  ]);

  const rawPosts = (postsResult.data as ContentRow[]) ?? [];
  const rawMarketplace = (marketplaceResult.data as ContentRow[]) ?? [];
  const rawLoveLocal = (loveLocalResult.data as ContentRow[]) ?? [];
  const rawReports = (reportsResult.data as unknown as ReportRow[]) ?? [];

  // Batch lookup profiles for authors
  const authorIds = Array.from(
    new Set(
      [...rawPosts, ...rawMarketplace, ...rawLoveLocal]
        .map((r) => r.author_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const authorMap = new Map<string, { full_name: string | null; business_name: string | null }>();
  if (authorIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, business_name")
      .in("id", authorIds);

    for (const p of profiles ?? []) {
      authorMap.set(p.id, p);
    }
  }

  // Batch lookup profiles for reporters
  const reporterIds = Array.from(
    new Set(rawReports.map((r) => r.reporter_id).filter((id): id is string => Boolean(id)))
  );
  const reporterMap = new Map<string, { full_name: string | null }>();
  if (reporterIds.length > 0) {
    const { data: repProfiles } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", reporterIds);

    for (const p of repProfiles ?? []) {
      reporterMap.set(p.id, p);
    }
  }

  const byId = new Map<string, ModerationDetail | ReportDetail>();
  const items: InboxItemInput[] = [];

  const contentSets: [ModerationTable, ContentRow[]][] = [
    ["community_posts", rawPosts],
    ["marketplace_listings", rawMarketplace],
    ["love_local_offers", rawLoveLocal],
  ];

  for (const [table, rows] of contentSets) {
    for (const row of rows) {
      const profile = row.author_id ? authorMap.get(row.author_id) : null;
      const authorName =
        profile?.business_name || profile?.full_name || (row.author_id ? "Unknown User" : "Anonymous");
      const categoryLabel = MODERATION_CATEGORIES.find((c) => c.id === table)?.label ?? table;

      byId.set(row.id, { kind: "content", table, row, authorName });
      items.push({
        id: row.id,
        categoryId: table,
        title: row.title,
        subtitle: `${authorName} • ${categoryLabel}`,
        preview: row.content || row.description || "",
        timestamp: row.created_at,
        isNew: true,
        badge: { label: "Pending", variant: "outline" },
      });
    }
  }

  for (const row of rawReports) {
    const reporter = reporterMap.get(row.reporter_id);
    const reporterName = reporter?.full_name || "Resident";

    byId.set(row.id, { kind: "report", row, reporterName });
    items.push({
      id: row.id,
      categoryId: "reports",
      title: row.community_posts?.title || "Reported post",
      subtitle: `Reported by ${reporterName}`,
      preview: row.reason || "No reason given",
      timestamp: row.created_at,
      isNew: true,
      badge: { label: "Open", variant: "destructive" },
    });
  }

  const categories: InboxCategory[] = MODERATION_CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    count: items.filter((i) => i.categoryId === c.id).length,
  }));

  return { categories, items, byId };
}
