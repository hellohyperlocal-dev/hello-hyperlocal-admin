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
  comment_id?: string | null;
  reporter_id: string;
  reason: string | null;
  status: string;
  created_at: string;
  community_posts: { title: string; content: string } | null;
  post_comments?: { id: string; content: string; author_id: string } | null;
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

export interface ModerationQueueItem {
  id: string;
  kind: "community_posts" | "marketplace_listings" | "love_local_offers" | "reports";
  table?: ModerationTable;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  authorName: string;
  authorId?: string | null;
  authorAvatar?: string | null;
  initials: string;
  date: string;
  rawDate: string;
  imageUrl?: string | null;
  price?: string | null;
  reportReason?: string | null;
  reportedPostContent?: string | null;
  reportTarget?: "post" | "comment";
  commentId?: string | null;
}

export interface ModerationDashboardData {
  stats: {
    totalPending: number;
    pendingPosts: number;
    pendingMarketplace: number;
    openReports: number;
  };
  items: ModerationQueueItem[];
}

function getInitials(name: string): string {
  if (!name) return "HL";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

const SAMPLE_MODERATION_ITEMS: ModerationQueueItem[] = [
  {
    id: "sample-mod-1",
    kind: "community_posts",
    table: "community_posts",
    title: "Load shedding schedule for Linden Sector 1",
    excerpt: "Sharing the updated schedule for our area this week. Please check your sub-zone.",
    content: "Sharing the updated schedule for our area this week. Please check your sub-zone before planning cooking or work hours. Let's keep each other informed.",
    category: "Neighbourhood Talk",
    authorName: "Sarah Jenkins",
    authorId: null,
    authorAvatar: null,
    initials: "SJ",
    date: "Today, 10:14",
    rawDate: new Date().toISOString(),
    imageUrl: null,
  },
  {
    id: "sample-mod-2",
    kind: "marketplace_listings",
    table: "marketplace_listings",
    title: "Vintage Solid Oak Coffee Table - Excellent condition",
    excerpt: "Moving sale. Beautiful solid oak table looking for a new home in Linden.",
    content: "Moving sale. Beautiful solid oak table looking for a new home in Linden. 120cm x 60cm. Pickup in 6th Street near Emma Park.",
    category: "Marketplace",
    authorName: "Johan Pretorius",
    authorId: null,
    authorAvatar: null,
    initials: "JP",
    date: "Yesterday",
    rawDate: new Date(Date.now() - 86400000).toISOString(),
    price: "R 1,200",
    imageUrl: null,
  },
  {
    id: "sample-mod-3",
    kind: "reports",
    reportTarget: "post",
    title: "Reported: Unsolicited business advertisement in general chat",
    excerpt: "User reported spam marketing posted in the neighborhood lost-found section.",
    content: "Multiple users reported this post for violating rules on commercial spam.",
    category: "Flagged Report",
    authorName: "Reported by Mark D.",
    authorId: null,
    authorAvatar: null,
    initials: "MD",
    date: "Oct 07, 2026",
    rawDate: new Date(Date.now() - 172800000).toISOString(),
    reportReason: "Unsolicited crypto investment scheme posted in pet group.",
    reportedPostContent: "Make 200% return in 3 days! WhatsApp me now on 082-XXX-XXXX for easy money.",
  },
  {
    id: "sample-mod-4",
    kind: "reports",
    reportTarget: "comment",
    commentId: "sample-comment-1",
    title: "Flagged Comment on \"Load shedding schedule\"",
    excerpt: "Reason: Harassment / abusive personal attacks against another resident.",
    content: "Keep quiet you don't know anything about Linden, mind your own business.",
    category: "Reported Comment",
    authorName: "Reported by Lerato K.",
    authorId: null,
    authorAvatar: null,
    initials: "LK",
    date: "Oct 08, 2026",
    rawDate: new Date(Date.now() - 3600000 * 2).toISOString(),
    reportReason: "Harassment / abusive personal attacks against another resident.",
    reportedPostContent: "Keep quiet you don't know anything about Linden, mind your own business.",
  },
];

export async function getModerationDashboardData(): Promise<ModerationDashboardData> {
  const { isPreviewMode } = await import("@/lib/preview-mode");
  if (isPreviewMode) {
    return {
      stats: {
        totalPending: SAMPLE_MODERATION_ITEMS.length,
        pendingPosts: 1,
        pendingMarketplace: 1,
        openReports: 1,
      },
      items: SAMPLE_MODERATION_ITEMS,
    };
  }

  const admin = createAdminClient();

  const [postsResult, marketplaceResult, loveLocalResult, reportsResult] = await Promise.all([
    admin
      .from("community_posts")
      .select("id, author_id, category, title, content, image_url, created_at, moderation_status, rejection_reason")
      .eq("moderation_status", "pending")
      .order("created_at", { ascending: false }),
    admin
      .from("marketplace_listings")
      .select("id, author_id, category, title, description, price, image_url, created_at, moderation_status, rejection_reason")
      .eq("moderation_status", "pending")
      .order("created_at", { ascending: false }),
    admin
      .from("love_local_offers")
      .select("id, author_id, category, title, description, price, image_url, created_at, moderation_status, rejection_reason")
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

  const authorIds = Array.from(
    new Set(
      [...rawPosts, ...rawMarketplace, ...rawLoveLocal]
        .map((r) => r.author_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const authorMap = new Map<string, { full_name: string | null; business_name: string | null; avatar_url?: string | null }>();
  if (authorIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, business_name, avatar_url")
      .in("id", authorIds);

    for (const p of profiles ?? []) {
      authorMap.set(p.id, p);
    }
  }

  const reporterIds = Array.from(
    new Set(rawReports.map((r) => r.reporter_id).filter((id): id is string => Boolean(id)))
  );
  const reporterMap = new Map<string, { full_name: string | null; avatar_url?: string | null }>();
  if (reporterIds.length > 0) {
    const { data: repProfiles } = await admin
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", reporterIds);

    for (const p of repProfiles ?? []) {
      reporterMap.set(p.id, p);
    }
  }

  const items: ModerationQueueItem[] = [];

  // Community posts
  for (const post of rawPosts) {
    const p = post.author_id ? authorMap.get(post.author_id) : null;
    const authorName = p?.full_name || "Community Resident";
    const text = post.content || "";
    const excerpt = text.length > 95 ? text.slice(0, 95).trim() + "…" : text;

    items.push({
      id: post.id,
      kind: "community_posts",
      table: "community_posts",
      title: post.title || "Untitled Community Post",
      excerpt: excerpt || "No content provided.",
      content: text,
      category: "Community Post",
      authorName,
      authorId: post.author_id,
      authorAvatar: p?.avatar_url || null,
      initials: getInitials(authorName),
      date: formatDate(post.created_at),
      rawDate: post.created_at,
      imageUrl: post.image_url,
    });
  }

  // Marketplace listings
  for (const item of rawMarketplace) {
    const p = item.author_id ? authorMap.get(item.author_id) : null;
    const authorName = p?.full_name || "Resident";
    const text = item.description || "";
    const excerpt = text.length > 95 ? text.slice(0, 95).trim() + "…" : text;

    items.push({
      id: item.id,
      kind: "marketplace_listings",
      table: "marketplace_listings",
      title: item.title || "Marketplace Listing",
      excerpt: excerpt || "No description.",
      content: text,
      category: "Marketplace Item",
      authorName,
      authorId: item.author_id,
      authorAvatar: p?.avatar_url || null,
      initials: getInitials(authorName),
      date: formatDate(item.created_at),
      rawDate: item.created_at,
      imageUrl: item.image_url,
      price: item.price || null,
    });
  }

  // Love local offers
  for (const offer of rawLoveLocal) {
    const p = offer.author_id ? authorMap.get(offer.author_id) : null;
    const authorName = p?.business_name || p?.full_name || "Local Business";
    const text = offer.description || "";
    const excerpt = text.length > 95 ? text.slice(0, 95).trim() + "…" : text;

    items.push({
      id: offer.id,
      kind: "love_local_offers",
      table: "love_local_offers",
      title: offer.title || "Love Local Deal",
      excerpt: excerpt || "No description.",
      content: text,
      category: "Local Deal",
      authorName,
      authorId: offer.author_id,
      authorAvatar: p?.avatar_url || null,
      initials: getInitials(authorName),
      date: formatDate(offer.created_at),
      rawDate: offer.created_at,
      imageUrl: offer.image_url,
      price: offer.price || null,
    });
  }

  // Reports
  for (const rep of rawReports) {
    const r = reporterMap.get(rep.reporter_id);
    const reporterName = r?.full_name || "Resident";
    const reasonText = rep.reason || "Content flagged by resident.";
    const repPost = rep.community_posts;

    items.push({
      id: rep.id,
      kind: "reports",
      title: repPost?.title ? `Flagged: ${repPost.title}` : "Flagged Post Report",
      excerpt: `Reason: ${reasonText}`,
      content: repPost?.content || reasonText,
      category: "Flagged Report",
      authorName: `Reported by ${reporterName}`,
      authorId: rep.reporter_id,
      authorAvatar: r?.avatar_url || null,
      initials: getInitials(reporterName),
      date: formatDate(rep.created_at),
      rawDate: rep.created_at,
      reportReason: reasonText,
      reportedPostContent: repPost?.content || null,
    });
  }

  // Sort by date descending
  items.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());

  const pendingPosts = rawPosts.length;
  const pendingMarketplace = rawMarketplace.length + rawLoveLocal.length;
  const openReports = rawReports.length;
  const totalPending = pendingPosts + pendingMarketplace + openReports;

  return {
    stats: {
      totalPending,
      pendingPosts,
      pendingMarketplace,
      openReports,
    },
    items,
  };
}

