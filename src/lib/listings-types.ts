export const BUSINESS_CATEGORIES = [
  "Restaurants",
  "Coffee Shops",
  "Retail",
  "Guesthouses",
  "Hotel / Lodging",
  "Markets",
  "Experiences",
  "Other",
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

export interface BusinessRow {
  id: string;
  owner_id?: string | null;
  name: string;
  category: string;
  description?: string | null;
  address: string | null;
  hours?: string | null;
  is_open: boolean;
  rating: number;
  review_count: number;
  image_url?: string | null;
  video_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  also_in_marketplace?: boolean;
  created_at: string;
}

export interface ListingRow {
  id: string;
  author_id?: string | null;
  title: string;
  category: string;
  price: string;
  description?: string | null;
  tier?: string | null;
  image_url?: string | null;
  is_pre_approved?: boolean;
  moderation_status: string;
  created_at: string;
}

export interface LoveLocalOfferRow {
  id: string;
  author_id?: string | null;
  title: string;
  category: string;
  price: string;
  description?: string | null;
  is_special?: boolean;
  discount?: string | null;
  original_price?: string | null;
  offer_price?: string | null;
  expires_in?: string | null;
  address?: string | null;
  image_url?: string | null;
  moderation_status: string;
  created_at: string;
}
