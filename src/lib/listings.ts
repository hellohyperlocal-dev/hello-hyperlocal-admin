import { createAdminClient } from "@/lib/supabase/admin";
import type { BusinessRow, ListingRow, LoveLocalOfferRow } from "./listings-types";

export * from "./listings-types";

export async function getBusinesses(): Promise<BusinessRow[]> {
  const admin = createAdminClient();
  const [{ data: businesses }, { data: registrations }] = await Promise.all([
    admin
      .from("local_businesses")
      .select("id, owner_id, name, category, description, address, hours, rating, review_count, is_open, image_url, video_url, latitude, longitude, also_in_marketplace, created_at")
      .order("created_at", { ascending: false }),
    admin
      .from("registrations")
      .select("business_name, mobile")
      .not("business_name", "is", null)
      .not("mobile", "is", null),
  ]);

  const phoneMap = new Map<string, string>();
  if (registrations) {
    for (const reg of registrations) {
      if (reg.business_name && reg.mobile) {
        phoneMap.set(reg.business_name.toLowerCase().trim(), reg.mobile.trim());
      }
    }
  }

  const rawBusinesses = (businesses as BusinessRow[]) ?? [];
  return rawBusinesses.map((b) => ({
    ...b,
    phone: phoneMap.get(b.name.toLowerCase().trim()) ?? null,
  }));
}

export async function getBusinessById(id: string): Promise<BusinessRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("local_businesses")
    .select("id, owner_id, name, category, description, address, hours, rating, review_count, is_open, image_url, video_url, latitude, longitude, also_in_marketplace, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  const business = data as BusinessRow;

  // Look up matching registration phone
  const { data: reg } = await admin
    .from("registrations")
    .select("mobile")
    .ilike("business_name", business.name.trim())
    .not("mobile", "is", null)
    .limit(1)
    .maybeSingle();

  return {
    ...business,
    phone: reg?.mobile ?? null,
  };
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
