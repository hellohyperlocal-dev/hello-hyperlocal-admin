import { createAdminClient } from "@/lib/supabase/admin";
import { isPreviewMode } from "@/lib/preview-mode";

export interface WardUpdateItem {
  id: string;
  title: string;
  category: string;
  ward: string;
  body: string;
  isPinned: boolean;
  imageUrl: string | null;
  createdAt: string;
  date: string;
  councillorId: string | null;
  councillorName: string;
  councillorAvatar: string | null;
  initials: string;
  reactions: number;
}

export interface WardUpdatesStats {
  total: number;
  pinned: number;
  wardsCovered: number;
  totalReactions: number;
}

export interface CouncillorOption {
  id: string;
  fullName: string;
  ward: string | null;
}

export interface WardUpdatesDashboardData {
  items: WardUpdateItem[];
  stats: WardUpdatesStats;
  councillors: CouncillorOption[];
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-ZA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recent";
  }
}

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CU"
  );
}

const SAMPLE_COUNCILLORS: CouncillorOption[] = [
  { id: "councillor-1", fullName: "Cllr. T. Mahlangu", ward: "Ward 87" },
  { id: "councillor-2", fullName: "Cllr. J. Steyn", ward: "Ward 99" },
];

const SAMPLE_UPDATES: WardUpdateItem[] = [
  {
    id: "sample-w1",
    title: "Water outage scheduled for Tuesday maintenance",
    category: "water",
    ward: "Ward 87",
    body: "Johannesburg Water has scheduled maintenance on the main junction along 4th Avenue. Low water pressure or intermittent supply expected between 08:00 and 16:00.",
    isPinned: true,
    imageUrl: null,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    date: formatDate(new Date(Date.now() - 3600000 * 4).toISOString()),
    councillorId: "councillor-1",
    councillorName: "Cllr. T. Mahlangu",
    councillorAvatar: null,
    initials: "TM",
    reactions: 42,
  },
  {
    id: "sample-w2",
    title: "City Power: Linden Substation load-shedding switch gear fix",
    category: "load-shedding",
    ward: "Ward 99",
    body: "Technicians have completed the overhaul of the medium voltage switchgear at Linden substation. Reduced trip risk during upcoming scheduled intervals.",
    isPinned: false,
    imageUrl: null,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    date: formatDate(new Date(Date.now() - 3600000 * 24).toISOString()),
    councillorId: "councillor-2",
    councillorName: "Cllr. J. Steyn",
    councillorAvatar: null,
    initials: "JS",
    reactions: 19,
  },
  {
    id: "sample-w3",
    title: "CPF & SAPS joint security briefing this Thursday",
    category: "safety",
    ward: "Ward 87",
    body: "Residents and business owners are encouraged to attend the monthly Community Policing Forum meeting at the Linden Library Hall at 18:30.",
    isPinned: false,
    imageUrl: null,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    date: formatDate(new Date(Date.now() - 3600000 * 48).toISOString()),
    councillorId: "councillor-1",
    councillorName: "Cllr. T. Mahlangu",
    councillorAvatar: null,
    initials: "TM",
    reactions: 31,
  },
];

export async function getWardUpdatesDashboardData(): Promise<WardUpdatesDashboardData> {
  if (isPreviewMode) {
    return {
      items: SAMPLE_UPDATES,
      stats: {
        total: SAMPLE_UPDATES.length,
        pinned: SAMPLE_UPDATES.filter((u) => u.isPinned).length,
        wardsCovered: 2,
        totalReactions: 92,
      },
      councillors: SAMPLE_COUNCILLORS,
    };
  }

  const supabase = createAdminClient();

  const [updatesRes, reactionsRes, councillorsRes] = await Promise.all([
    supabase
      .from("ward_updates")
      .select("id, category, title, ward, body, is_pinned, image_url, created_at, councillor_id, profiles!councillor_id(full_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("ward_update_reactions")
      .select("ward_update_id"),
    supabase
      .from("profiles")
      .select("id, full_name, ward, role")
      .eq("role", "councillor"),
  ]);

  const reactionCounts: Record<string, number> = {};
  if (reactionsRes.data) {
    for (const r of reactionsRes.data) {
      if (r.ward_update_id) {
        reactionCounts[r.ward_update_id] = (reactionCounts[r.ward_update_id] || 0) + 1;
      }
    }
  }

  const councillors: CouncillorOption[] = (councillorsRes.data || []).map((c: any) => ({
    id: c.id,
    fullName: c.full_name || "Councillor",
    ward: c.ward || null,
  }));

  const items: WardUpdateItem[] = (updatesRes.data || []).map((u: any) => {
    const councillorName = u.profiles?.full_name || "Ward Councillor";
    const councillorAvatar = u.profiles?.avatar_url || null;
    const reactions = reactionCounts[u.id] || 0;

    return {
      id: u.id,
      title: u.title || "Ward Update",
      category: u.category || "notice",
      ward: u.ward || "Ward 87",
      body: u.body || "",
      isPinned: Boolean(u.is_pinned),
      imageUrl: u.image_url || null,
      createdAt: u.created_at,
      date: formatDate(u.created_at),
      councillorId: u.councillor_id || null,
      councillorName,
      councillorAvatar,
      initials: getInitials(councillorName),
      reactions,
    };
  });

  const distinctWards = new Set(items.map((i) => i.ward)).size;
  const pinnedCount = items.filter((i) => i.isPinned).length;
  const totalReactions = Object.values(reactionCounts).reduce((acc, count) => acc + count, 0);

  return {
    items,
    stats: {
      total: items.length,
      pinned: pinnedCount,
      wardsCovered: distinctWards,
      totalReactions,
    },
    councillors,
  };
}
