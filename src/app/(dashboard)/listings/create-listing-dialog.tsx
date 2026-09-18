"use client";

import { useState, useTransition } from "react";
import { Plus, Store, ShoppingBag, Tag } from "lucide-react";
import { toast } from "sonner";
import { createBusiness, createMarketplaceListing, createLoveLocalOffer } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BUSINESS_CATEGORIES = [
  "Restaurants",
  "Coffee Shops",
  "Retail",
  "Guesthouses",
  "Markets",
  "Experiences",
];

export function CreateListingDialog() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("business");
  const [businessCategory, setBusinessCategory] = useState("Restaurants");
  const [marketplaceCategory, setMarketplaceCategory] = useState("for-sale");
  const [offerCategory, setOfferCategory] = useState("Restaurants");
  const [isSpecial, setIsSpecial] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleCreateBusiness(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("category", businessCategory);

    startTransition(async () => {
      const result = await createBusiness(formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Business added to directory.");
      setOpen(false);
      form.reset();
    });
  }

  function handleCreateMarketplace(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("category", marketplaceCategory);

    startTransition(async () => {
      const result = await createMarketplaceListing(formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Marketplace listing published.");
      setOpen(false);
      form.reset();
    });
  }

  function handleCreateOffer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("category", offerCategory);
    formData.set("isSpecial", String(isSpecial));

    startTransition(async () => {
      const result = await createLoveLocalOffer(formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Love Local offer published.");
      setOpen(false);
      form.reset();
      setIsSpecial(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" /> Add business / listing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Add to directory or listings</DialogTitle>
          <DialogDescription>
            Publish a local business, marketplace ad, or special offer directly to the app.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="business" className="gap-1.5 text-xs">
              <Store className="size-3.5" /> Business
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-1.5 text-xs">
              <ShoppingBag className="size-3.5" /> Marketplace
            </TabsTrigger>
            <TabsTrigger value="offer" className="gap-1.5 text-xs">
              <Tag className="size-3.5" /> Love Local
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: LOCAL BUSINESS */}
          <TabsContent value="business" className="pt-2">
            <form onSubmit={handleCreateBusiness} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="biz-name">Business name</Label>
                  <Input id="biz-name" name="name" placeholder="e.g. Satori Pizza" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="biz-category">Category</Label>
                  <Select value={businessCategory} onValueChange={setBusinessCategory}>
                    <SelectTrigger id="biz-category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="biz-address">Physical address</Label>
                <Input id="biz-address" name="address" placeholder="e.g. 61 4th Avenue, Linden" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="biz-hours">Operating hours</Label>
                  <Input id="biz-hours" name="hours" placeholder="e.g. Mon-Sat 08:00 - 17:00" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="biz-rating">Initial rating</Label>
                  <Input id="biz-rating" name="rating" type="number" step="0.1" min="1" max="5" defaultValue="5.0" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="biz-desc">Description</Label>
                <Textarea id="biz-desc" name="description" placeholder="Brief about the business..." rows={2} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="biz-img">Image URL (optional)</Label>
                <Input id="biz-img" name="imageUrl" placeholder="https://..." />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Adding…" : "Add business"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* TAB 2: MARKETPLACE LISTING */}
          <TabsContent value="marketplace" className="pt-2">
            <form onSubmit={handleCreateMarketplace} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="mp-title">Title</Label>
                <Input id="mp-title" name="title" placeholder="e.g. Handcrafted wooden coffee table" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="mp-category">Category</Label>
                  <Select value={marketplaceCategory} onValueChange={setMarketplaceCategory}>
                    <SelectTrigger id="mp-category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="for-sale">For Sale</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="stays">Stays</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mp-price">Price display</Label>
                  <Input id="mp-price" name="price" placeholder="e.g. R450 or R180/hr" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mp-desc">Description</Label>
                <Textarea id="mp-desc" name="description" placeholder="Details about what's offered or for sale..." rows={3} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mp-img">Image URL (optional)</Label>
                <Input id="mp-img" name="imageUrl" placeholder="https://..." />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Publishing…" : "Publish listing"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* TAB 3: LOVE LOCAL OFFER */}
          <TabsContent value="offer" className="pt-2">
            <form onSubmit={handleCreateOffer} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="offer-title">Offer headline</Label>
                <Input id="offer-title" name="title" placeholder="e.g. Buy 1 coffee, get 1 pastry free" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="offer-category">Business category</Label>
                  <Select value={offerCategory} onValueChange={setOfferCategory}>
                    <SelectTrigger id="offer-category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="offer-price">Price / Value</Label>
                  <Input id="offer-price" name="price" placeholder="e.g. Free or R65" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="offer-desc">Offer description</Label>
                <Textarea id="offer-desc" name="description" placeholder="Explain the special or promo..." rows={2} />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isSpecial"
                  checked={isSpecial}
                  onChange={(e) => setIsSpecial(e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-ring"
                />
                <Label htmlFor="isSpecial" className="text-sm font-normal cursor-pointer">
                  This is a limited-time discount or special
                </Label>
              </div>

              {isSpecial && (
                <div className="grid grid-cols-3 gap-2 rounded-md border border-border/60 bg-muted/30 p-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="discount" className="text-xs">Discount tag</Label>
                    <Input id="discount" name="discount" placeholder="e.g. 20% OFF" className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="offerPrice" className="text-xs">Offer price</Label>
                    <Input id="offerPrice" name="offerPrice" placeholder="e.g. R80" className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="expiresIn" className="text-xs">Expires in</Label>
                    <Input id="expiresIn" name="expiresIn" placeholder="e.g. 3 days" className="h-8 text-xs" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="offer-img">Image URL (optional)</Label>
                <Input id="offer-img" name="imageUrl" placeholder="https://..." />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Publishing…" : "Publish offer"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
