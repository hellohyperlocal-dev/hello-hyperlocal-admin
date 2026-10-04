import {
  getBusinesses,
  getMarketplaceListings,
  getLoveLocalOffers,
  type BusinessRow,
  type ListingRow,
  type LoveLocalOfferRow,
} from "@/lib/listings";
import { isPreviewMode } from "@/lib/preview-mode";
import { ListingsClient } from "./listings-client";

const SAMPLE_BUSINESSES: BusinessRow[] = [
  {
    id: "sample-1",
    name: "Corner Cafe",
    category: "Restaurants",
    address: "12 4th Ave, Linden",
    description: "A cozy neighborhood cafe serving artisan roasts and fresh breakfast pastries.",
    hours: "7am–5pm daily",
    is_open: true,
    rating: 4.8,
    review_count: 42,
    image_url: null,
    video_url: null,
    latitude: -26.1417,
    longitude: 27.9971,
    also_in_marketplace: false,
    created_at: new Date().toISOString(),
  },
];
const SAMPLE_LISTINGS: ListingRow[] = [];
const SAMPLE_OFFERS: LoveLocalOfferRow[] = [];

export default async function ListingsPage() {
  const [businesses, marketplace, loveLocal] = isPreviewMode
    ? [SAMPLE_BUSINESSES, SAMPLE_LISTINGS, SAMPLE_OFFERS]
    : await Promise.all([getBusinesses(), getMarketplaceListings(), getLoveLocalOffers()]);

  return (
    <div className="min-w-0 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Businesses &amp; Listings
        </h1>
        <p className="text-sm text-muted-foreground">
          Oversight, deep inspection, and management of local businesses, marketplace ads, and Love Local specials.
        </p>
      </div>

      <ListingsClient
        initialBusinesses={businesses}
        initialMarketplace={marketplace}
        initialLoveLocal={loveLocal}
      />
    </div>
  );
}
