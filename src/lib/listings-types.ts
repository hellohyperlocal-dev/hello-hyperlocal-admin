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
