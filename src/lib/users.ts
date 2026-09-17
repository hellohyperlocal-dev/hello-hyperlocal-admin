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
    query = query.or(
      `full_name.ilike.%${opts.search}%,business_name.ilike.%${opts.search}%,phone_number.ilike.%${opts.search}%`
    );
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
