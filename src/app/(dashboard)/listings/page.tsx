import {
  getBusinesses,
  getMarketplaceListings,
  getLoveLocalOffers,
  type BusinessRow,
  type ListingRow,
  type LoveLocalOfferRow,
} from "@/lib/listings";
import { isPreviewMode } from "@/lib/preview-mode";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateListingDialog } from "./create-listing-dialog";
import { BusinessTable } from "./business-table";
import { ListingTableClient } from "./listing-table-client";

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
    <div className="min-w-0 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Businesses &amp; Listings</h1>
          <p className="text-sm text-muted-foreground">
            Oversight, deep inspection, and management of local businesses, marketplace ads, and Love Local specials.
          </p>
        </div>
        <CreateListingDialog />
      </div>

      <Tabs defaultValue="businesses" className="w-full">
        <div className="overflow-x-auto pb-1">
          <TabsList className="w-full sm:w-auto inline-flex">
            <TabsTrigger value="businesses" className="flex-1 sm:flex-initial">
              Businesses ({businesses.length})
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex-1 sm:flex-initial">
              Marketplace ({marketplace.length})
            </TabsTrigger>
            <TabsTrigger value="love-local" className="flex-1 sm:flex-initial">
              Love Local ({loveLocal.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="businesses" className="mt-4">
          <Card className="py-0 overflow-hidden">
            <BusinessTable businesses={businesses} />
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="mt-4">
          <Card className="py-0 overflow-hidden">
            <ListingTableClient table="marketplace_listings" listings={marketplace} />
          </Card>
        </TabsContent>

        <TabsContent value="love-local" className="mt-4">
          <Card className="py-0 overflow-hidden">
            <ListingTableClient table="love_local_offers" listings={loveLocal} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
