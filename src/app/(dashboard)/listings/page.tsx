import { getBusinesses, getMarketplaceListings, getLoveLocalOffers, type BusinessRow, type ListingRow } from "@/lib/listings";
import { isPreviewMode } from "@/lib/preview-mode";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UnpublishButton } from "./unpublish-button";

const SAMPLE_BUSINESSES: BusinessRow[] = [
  { id: "sample-1", name: "Corner Cafe", category: "Food", address: "12 4th Ave", is_open: true, rating: 4.5, review_count: 12, created_at: new Date().toISOString() },
];
const SAMPLE_LISTINGS: ListingRow[] = [];

export default async function ListingsPage() {
  const [businesses, marketplace, loveLocal] = isPreviewMode
    ? [SAMPLE_BUSINESSES, SAMPLE_LISTINGS, SAMPLE_LISTINGS]
    : await Promise.all([getBusinesses(), getMarketplaceListings(), getLoveLocalOffers()]);

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Businesses &amp; Listings</h1>
        <p className="text-sm text-muted-foreground">Oversight of local businesses, marketplace, and Love Local.</p>
      </div>

      <Tabs defaultValue="businesses">
        <TabsList>
          <TabsTrigger value="businesses">Businesses ({businesses.length})</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace ({marketplace.length})</TabsTrigger>
          <TabsTrigger value="love-local">Love Local ({loveLocal.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="businesses">
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No businesses yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  businesses.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell>{b.category}</TableCell>
                      <TableCell>{b.address || "—"}</TableCell>
                      <TableCell>
                        {b.rating.toFixed(1)} ({b.review_count})
                      </TableCell>
                      <TableCell>
                        <Badge variant={b.is_open ? "secondary" : "outline"}>{b.is_open ? "Open" : "Closed"}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace">
          <ListingTable table="marketplace_listings" listings={marketplace} />
        </TabsContent>

        <TabsContent value="love-local">
          <ListingTable table="love_local_offers" listings={loveLocal} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ListingTable({ table, listings }: { table: "marketplace_listings" | "love_local_offers"; listings: ListingRow[] }) {
  return (
    <Card className="py-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Nothing here yet.
              </TableCell>
            </TableRow>
          ) : (
            listings.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.title}</TableCell>
                <TableCell>{l.category}</TableCell>
                <TableCell>{l.price}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      l.moderation_status === "approved" ? "secondary" : l.moderation_status === "rejected" ? "outline" : "default"
                    }
                  >
                    {l.moderation_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <UnpublishButton table={table} id={l.id} status={l.moderation_status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
