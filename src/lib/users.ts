import { createAdminClient } from "@/lib/supabase/admin";

export interface UserRow {
  id: string;
  role: string;
  full_name: string | null;
  phone_number: string | null;
  street_address: string | null;
  business_name: string | null;
  ward: string | null;
  is_suspended: boolean;
  suspended_at: string | null;
  suspended_reason: string | null;
  created_at: string;
}

const PAGE_SIZE = 25;

export async function getUsers(opts: { role?: string; search?: string; page?: number }) {
  const admin = createAdminClient();
  const page = opts.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = admin
    .from("profiles")
    .select(
      "id, role, full_name, phone_number, street_address, business_name, ward, is_suspended, suspended_at, suspended_reason, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (opts.role && opts.role !== "all") {
    query = query.eq("role", opts.role);
  }
  if (opts.search) {
    // PostgREST .or() uses commas as delimiters and parentheses for logical grouping.
    // Unsanitized commas, parentheses, or quotes break the expression syntax and cause 400 Bad Request.
    const sanitized = opts.search.replace(/[,()"]/g, " ").replace(/\s+/g, " ").trim();
    if (sanitized) {
      query = query.or(
        `full_name.ilike.%${sanitized}%,business_name.ilike.%${sanitized}%,phone_number.ilike.%${sanitized}%`
      );
    }
  }

  const { data, count, error } = await query;
  if (error) {
    return { users: [] as UserRow[], total: 0, page, totalPages: 1 };
  }

  const total = count ?? 0;
  return { users: (data as UserRow[]) ?? [], total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Fetches the email for one user via the Auth Admin API — not stored on
 * profiles, so only looked up for a single selected user, not the whole
 * list (avoids an admin.auth.admin.listUsers() call per row). */
export async function getUserEmail(id: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(id);
  if (error || !data.user) return null;
  return data.user.email ?? null;
}

export interface UserDetail extends UserRow {
  email: string | null;
  communityPostsCount: number;
  marketplaceListingsCount: number;
  loveLocalOffersCount: number;
  rsvpCount: number;
  recentPosts: { id: string; title: string; moderation_status: string; created_at: string }[];
}

export async function getUserDetail(id: string): Promise<UserDetail | null> {
  const admin = createAdminClient();

  const [profileResult, email, postsCount, listingsCount, offersCount, rsvpsCount, recentPostsResult] =
    await Promise.all([
      admin
        .from("profiles")
        .select(
          "id, role, full_name, phone_number, street_address, business_name, ward, is_suspended, suspended_at, suspended_reason, created_at"
        )
        .eq("id", id)
        .single(),
      getUserEmail(id),
      admin.from("community_posts").select("id", { count: "exact", head: true }).eq("author_id", id),
      admin.from("marketplace_listings").select("id", { count: "exact", head: true }).eq("author_id", id),
      admin.from("love_local_offers").select("id", { count: "exact", head: true }).eq("author_id", id),
      admin.from("event_rsvps").select("id", { count: "exact", head: true }).eq("user_id", id),
      admin
        .from("community_posts")
        .select("id, title, moderation_status, created_at")
        .eq("author_id", id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  if (!profileResult.data) return null;

  return {
    ...(profileResult.data as UserRow),
    email,
    communityPostsCount: postsCount.count ?? 0,
    marketplaceListingsCount: listingsCount.count ?? 0,
    loveLocalOffersCount: offersCount.count ?? 0,
    rsvpCount: rsvpsCount.count ?? 0,
    recentPosts: (recentPostsResult.data as UserDetail["recentPosts"]) ?? [],
  };
}
