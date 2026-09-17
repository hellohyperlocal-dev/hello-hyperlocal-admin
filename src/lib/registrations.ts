import { createAdminClient } from "@/lib/supabase/admin";
import type { InboxCategory, InboxItemInput } from "@/components/inbox/types";

export const REGISTRATION_ROLES = [
  { id: "founding_neighbour", label: "Founding Neighbour" },
  { id: "founding_business", label: "Founding Business" },
  { id: "partner_interest", label: "Partner Interest" },
  { id: "general_enquiry", label: "General Enquiry" },
] as const;

interface RegistrationRow {
  id: string;
  email: string;
  roles: string[];
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  mobile: string | null;
  suburb: string | null;
  interests: string[];
  business_name: string | null;
  business_address: string | null;
  wants_window_sticker: boolean;
  details: Record<string, unknown> | null;
  consent_at: string | null;
  source: string;
  created_at: string;
  claimed_profile_id: string | null;
  claimed_at: string | null;
}

export interface RegistrationDetail extends RegistrationRow {
  primaryRole: string;
}

/** Picks the "most specific" role for nav-category grouping when a
 * registration holds multiple roles (e.g. resident + business). */
function primaryRoleOf(roles: string[]): string {
  return REGISTRATION_ROLES.find((r) => roles.includes(r.id))?.id ?? roles[0] ?? "general_enquiry";
}

function nameOf(row: RegistrationRow): string {
  return row.full_name || [row.first_name, row.last_name].filter(Boolean).join(" ") || row.business_name || row.email;
}

function previewOf(row: RegistrationRow): string {
  if (row.details && typeof row.details === "object") {
    const details = row.details as Record<string, unknown>;
    if (typeof details.message === "string" && details.message) return details.message;
    if (typeof details.organisation === "string" && details.organisation) return `From ${details.organisation}`;
  }
  if (row.business_name) return row.business_address || row.business_name;
  if (row.suburb) return `${row.suburb} resident`;
  return row.email;
}

export async function getRegistrations(): Promise<{ categories: InboxCategory[]; items: InboxItemInput[]; byId: Map<string, RegistrationDetail> }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("registrations")
    .select(
      "id, email, roles, first_name, last_name, full_name, mobile, suburb, interests, business_name, business_address, wants_window_sticker, details, consent_at, source, created_at, claimed_profile_id, claimed_at"
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { categories: REGISTRATION_ROLES.map((r) => ({ ...r, count: 0 })), items: [], byId: new Map() };
  }

  const rows = data as RegistrationRow[];
  const byId = new Map<string, RegistrationDetail>();
  const items: InboxItemInput[] = rows.map((row) => {
    const primaryRole = primaryRoleOf(row.roles);
    byId.set(row.id, { ...row, primaryRole });
    return {
      id: row.id,
      categoryId: primaryRole,
      title: nameOf(row),
      subtitle: REGISTRATION_ROLES.find((r) => r.id === primaryRole)?.label ?? primaryRole,
      preview: previewOf(row),
      timestamp: row.created_at,
      isNew: !row.claimed_at,
      badge: row.claimed_at ? { label: "Claimed", variant: "secondary" } : undefined,
    };
  });

  const categories: InboxCategory[] = REGISTRATION_ROLES.map((r) => ({
    ...r,
    count: items.filter((i) => i.categoryId === r.id).length,
  }));

  return { categories, items, byId };
}
