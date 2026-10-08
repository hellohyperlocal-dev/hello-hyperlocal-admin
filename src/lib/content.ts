import { createAdminClient } from "@/lib/supabase/admin";
import { isPreviewMode } from "@/lib/preview-mode";

export interface CmsPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorAvatar?: string | null;
  initials: string;
  status: "Published" | "Scheduled" | "Draft";
  date: string;
  rawDate: string;
  likes: number;
  comments: number;
  imageUrl?: string | null;
  color: string;
  sourceTable: "community_posts" | "ward_updates";
  isPinned?: boolean;
  moderationStatus?: string;
}

export interface CmsContentData {
  posts: CmsPost[];
  stats: {
    total: number;
    published: number;
    scheduled: number;
    drafts: number;
  };
}

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  hood: { label: "Neighbourhood Talk", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" },
  event: { label: "Events", color: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300" },
  "lost-found": { label: "Lost & Found", color: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300" },
  recommendation: { label: "Recommendations", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300" },
  job: { label: "Local Jobs", color: "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300" },
  business: { label: "Local Deals", color: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" },
  notice: { label: "Ward & Alerts", color: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" },
};

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

const SAMPLE_POSTS: CmsPost[] = [
  {
    id: "sample-1",
    title: "Linden Market Autumn Fair 2026",
    excerpt: "A full day of local makers, good food, music and family fun.",
    content: "Join us for the annual autumn fair at the Linden Market. Featuring over 120 local artisan stalls, craft beer, gourmet food trucks, and live music all day.",
    category: "Events",
    author: "Maya Singh",
    authorAvatar: null,
    initials: "MS",
    status: "Published",
    date: "Oct 04, 2026",
    rawDate: "2026-10-04T09:00:00Z",
    likes: 184,
    comments: 28,
    imageUrl: null,
    color: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
    sourceTable: "community_posts",
  },
  {
    id: "sample-2",
    title: "Ward 99: Emergency Water Pipe Repairs on 4th Ave",
    excerpt: "Repairs are underway. Please use alternate routes until further notice.",
    content: "Johannesburg Water has begun emergency repairs on a major feeder burst on 4th Avenue. Residents are advised of water pressure drops and temporary lane closures.",
    category: "Ward & Alerts",
    author: "Admin Team",
    authorAvatar: null,
    initials: "AT",
    status: "Published",
    date: "Oct 03, 2026",
    rawDate: "2026-10-03T11:30:00Z",
    likes: 92,
    comments: 45,
    imageUrl: null,
    color: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    sourceTable: "ward_updates",
    isPinned: true,
  },
  {
    id: "sample-3",
    title: "Golden Retriever found near 7th Street park",
    excerpt: "Friendly golden found this morning. Help us get them home safely.",
    content: "Found wearing a blue collar with no tag near 7th Street park around 07:30. Safe with a local resident. Please reach out if you recognize this dog.",
    category: "Lost & Found",
    author: "Lebo M.",
    authorAvatar: null,
    initials: "LM",
    status: "Published",
    date: "Oct 02, 2026",
    rawDate: "2026-10-02T08:15:00Z",
    likes: 76,
    comments: 12,
    imageUrl: null,
    color: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
    sourceTable: "community_posts",
  },
  {
    id: "sample-4",
    title: "Oregano Cafe: 20% off all breakfasts this weekend",
    excerpt: "Show your Hello Linden app at checkout to claim the offer.",
    content: "Oregano Cafe is celebrating spring with 20% off all artisanal breakfasts and coffees for verified Hello Linden app users this coming Saturday & Sunday.",
    category: "Local Deals",
    author: "Oregano Cafe",
    authorAvatar: null,
    initials: "OC",
    status: "Scheduled",
    date: "Oct 10, 2026",
    rawDate: "2026-10-10T06:00:00Z",
    likes: 0,
    comments: 0,
    imageUrl: null,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    sourceTable: "community_posts",
  },
  {
    id: "sample-5",
    title: "Draft: Community Safety & CPF Monthly Briefing",
    excerpt: "Notes and key takeaways for the next neighbourhood meeting.",
    content: "Monthly briefing on sector policing, neighbourhood watch patrols, camera installations, and incident reporting for Linden Sector 1 & 2.",
    category: "Neighbourhood Talk",
    author: "Admin Team",
    authorAvatar: null,
    initials: "AT",
    status: "Draft",
    date: "Yesterday",
    rawDate: "2026-10-07T14:00:00Z",
    likes: 0,
    comments: 0,
    imageUrl: null,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    sourceTable: "community_posts",
  },
];

export async function getContentData(): Promise<CmsContentData> {
  if (isPreviewMode) {
    return {
      posts: SAMPLE_POSTS,
      stats: {
        total: 248,
        published: 189,
        scheduled: 14,
        drafts: 45,
      },
    };
  }

  const admin = createAdminClient();

  const [postsRes, wardsRes, upvotesRes, commentsRes, wardReactionsRes] = await Promise.all([
    admin
      .from("community_posts")
      .select("id, author_id, category, title, content, image_url, is_pre_approved, moderation_status, created_at, profiles:author_id(full_name, avatar_url)")
      .order("created_at", { ascending: false }),
    admin
      .from("ward_updates")
      .select("id, councillor_id, category, title, body, ward, is_pinned, image_url, created_at, councillor:councillor_id(full_name, avatar_url)")
      .order("created_at", { ascending: false }),
    admin
      .from("post_upvotes")
      .select("post_id"),
    admin
      .from("post_comments")
      .select("post_id"),
    admin
      .from("ward_update_reactions")
      .select("ward_update_id"),
  ]);

  // Aggregate upvotes & comments per post
  const upvoteMap: Record<string, number> = {};
  if (upvotesRes.data) {
    for (const u of upvotesRes.data) {
      if (u.post_id) {
        upvoteMap[u.post_id] = (upvoteMap[u.post_id] || 0) + 1;
      }
    }
  }

  const commentsMap: Record<string, number> = {};
  if (commentsRes.data) {
    for (const c of commentsRes.data) {
      if (c.post_id) {
        commentsMap[c.post_id] = (commentsMap[c.post_id] || 0) + 1;
      }
    }
  }

  const wardReactionsMap: Record<string, number> = {};
  if (wardReactionsRes.data) {
    for (const r of wardReactionsRes.data) {
      if (r.ward_update_id) {
        wardReactionsMap[r.ward_update_id] = (wardReactionsMap[r.ward_update_id] || 0) + 1;
      }
    }
  }

  const unified: CmsPost[] = [];

  // Map community_posts
  if (postsRes.data) {
    for (const p of postsRes.data as any[]) {
      const catConfig = CATEGORY_MAP[p.category] || {
        label: p.category.charAt(0).toUpperCase() + p.category.slice(1),
        color: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
      };

      const authorName = p.profiles?.full_name || "Community Member";
      const authorAvatar = p.profiles?.avatar_url || null;
      const initials = getInitials(authorName);

      // Determine status: approved -> Published; pending -> Draft (or Scheduled if future)
      let status: "Published" | "Scheduled" | "Draft" = "Published";
      if (p.moderation_status === "pending") {
        status = "Draft";
      } else if (p.moderation_status === "rejected") {
        status = "Draft";
      }

      const likesCount = upvoteMap[p.id] || 0;
      const commentsCount = commentsMap[p.id] || 0;
      const text = p.content || "";
      const excerpt = text.length > 90 ? text.slice(0, 90).trim() + "…" : text;

      unified.push({
        id: p.id,
        title: p.title || "Untitled Post",
        excerpt: excerpt || "No description provided.",
        content: text,
        category: catConfig.label,
        author: authorName,
        authorAvatar,
        initials,
        status,
        date: formatDate(p.created_at),
        rawDate: p.created_at,
        likes: likesCount,
        comments: commentsCount,
        imageUrl: p.image_url,
        color: catConfig.color,
        sourceTable: "community_posts",
        moderationStatus: p.moderation_status,
      });
    }
  }

  // Map ward_updates
  if (wardsRes.data) {
    for (const w of wardsRes.data as any[]) {
      const authorName = w.councillor?.full_name || "Ward Councillor";
      const authorAvatar = w.councillor?.avatar_url || null;
      const initials = getInitials(authorName);
      const text = w.body || "";
      const excerpt = text.length > 90 ? text.slice(0, 90).trim() + "…" : text;
      const likesCount = wardReactionsMap[w.id] || 0;

      unified.push({
        id: w.id,
        title: w.title || "Ward Notice",
        excerpt: excerpt || "Official municipal update.",
        content: text,
        category: "Ward & Alerts",
        author: authorName,
        authorAvatar,
        initials,
        status: "Published",
        date: formatDate(w.created_at),
        rawDate: w.created_at,
        likes: likesCount,
        comments: 0,
        imageUrl: w.image_url,
        color: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
        sourceTable: "ward_updates",
        isPinned: w.is_pinned ?? false,
      });
    }
  }

  // Sort by date descending
  unified.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());

  const published = unified.filter((p) => p.status === "Published").length;
  const drafts = unified.filter((p) => p.status === "Draft").length;
  const scheduled = unified.filter((p) => p.status === "Scheduled").length;

  return {
    posts: unified,
    stats: {
      total: unified.length,
      published,
      scheduled,
      drafts,
    },
  };
}
