import { createAdminClient } from "@/lib/supabase/admin";

export interface BusinessRow {
  id: string;
  name: string;
  category: string;
  address: string | null;
  is_open: boolean;
  rating: number;
  review_count: number;
  created_at: string;
}

export interface ListingRow {
  id: string;
  title: string;
  category: string;
  price: string;
  moderation_status: string;
  created_at: string;
}

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
