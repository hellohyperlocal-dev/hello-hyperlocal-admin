import { createAdminClient } from "@/lib/supabase/admin";
import type { BusinessRow, ListingRow, LoveLocalOfferRow } from "./listings-types";

export * from "./listings-types";

export async function getBusinesses(): Promise<BusinessRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("local_businesses")
    .select("id, owner_id, name, category, description, address, hours, rating, review_count, is_open, image_url, video_url, latitude, longitude, also_in_marketplace, created_at")
    .order("created_at", { ascending: false });
  return (data as BusinessRow[]) ?? [];
}

export async function getBusinessById(id: string): Promise<BusinessRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("local_businesses")
    .select("id, owner_id, name, category, description, address, hours, rating, review_count, is_open, image_url, video_url, latitude, longitude, also_in_marketplace, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as BusinessRow;
}

export async function getMarketplaceListings(): Promise<ListingRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("marketplace_listings")
    .select("id, author_id, title, category, price, description, tier, image_url, is_pre_approved, moderation_status, created_at")
    .order("created_at", { ascending: false });
  return (data as ListingRow[]) ?? [];
}

export async function getLoveLocalOffers(): Promise<LoveLocalOfferRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("love_local_offers")
    .select("id, author_id, title, category, price, description, is_special, discount, original_price, offer_price, expires_in, address, image_url, moderation_status, created_at")
    .order("created_at", { ascending: false });
  return (data as LoveLocalOfferRow[]) ?? [];
}
