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

  const byId = new Map<string, ModerationDetail | ReportDetail>();
  const items: InboxItemInput[] = [];

  const contentSets: [ModerationTable, ContentRow[] | null][] = [
    ["community_posts", (postsResult.data as ContentRow[]) ?? null],
    ["marketplace_listings", (marketplaceResult.data as ContentRow[]) ?? null],
    ["love_local_offers", (loveLocalResult.data as ContentRow[]) ?? null],
  ];

  for (const [table, rows] of contentSets) {
    for (const row of rows ?? []) {
      byId.set(row.id, { kind: "content", table, row, authorName: "Author" });
      items.push({
        id: row.id,
        categoryId: table,
        title: row.title,
        subtitle: MODERATION_CATEGORIES.find((c) => c.id === table)?.label ?? table,
        preview: row.content || row.description || "",
        timestamp: row.created_at,
        isNew: true,
        badge: { label: "Pending", variant: "outline" },
      });
    }
  }

  const reports = (reportsResult.data as unknown as ReportRow[]) ?? [];
  for (const row of reports) {
    byId.set(row.id, { kind: "report", row });
    items.push({
      id: row.id,
      categoryId: "reports",
      title: row.community_posts?.title || "Reported post",
      subtitle: "Report",
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
