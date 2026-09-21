import { createAdminClient } from "@/lib/supabase/admin";
import type { BusinessRow, ListingRow } from "./listings-types";

export * from "./listings-types";

export async function getBusinesses(): Promise<BusinessRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("local_businesses")
    .select("id, name, category, address, is_open, rating, review_count, created_at")
    .order("created_at", { ascending: false });
  return (data as BusinessRow[]) ?? [];
}

export async function getMarketplaceListings(): Promise<ListingRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("marketplace_listings")
    .select("id, title, category, price, moderation_status, created_at")
    .order("created_at", { ascending: false });
  return (data as ListingRow[]) ?? [];
}

export async function getLoveLocalOffers(): Promise<ListingRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("love_local_offers")
    .select("id, title, category, price, moderation_status, created_at")
    .order("created_at", { ascending: false });
  return (data as ListingRow[]) ?? [];
}
