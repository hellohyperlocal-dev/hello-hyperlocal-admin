"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Store,
  MapPin,
  Clock,
  Star,
  ExternalLink,
  Edit3,
  Trash2,
  Tag,
  ShoppingBag,
  Calendar,
  Sparkles,
  Power,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteBusiness,
  toggleBusinessOpen,
  deleteListing,
  unpublishListing,
} from "./actions";
import type {
  BusinessRow,
  ListingRow,
  LoveLocalOfferRow,
} from "@/lib/listings-types";

type SheetItem =
  | { type: "business"; data: BusinessRow }
  | { type: "marketplace"; data: ListingRow }
  | { type: "offer"; data: LoveLocalOfferRow };

interface Props {
  item: SheetItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ListingDetailSheet({ item, open, onOpenChange }: Props) {
  const [pending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!item) return null;

  const handleDeleteBusiness = (id: string, name: string) => {
    startTransition(async () => {
      const res = await deleteBusiness(id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`"${name}" has been deleted.`);
      setDeleteDialogOpen(false);
      onOpenChange(false);
    });
  };

  const handleToggleOpen = (id: string, current: boolean) => {
    startTransition(async () => {
      const next = !current;
      const res = await toggleBusinessOpen(id, next);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Business is now marked as ${next ? "Open" : "Closed"}.`);
    });
  };

  const handleDeleteListing = (
    table: "marketplace_listings" | "love_local_offers",
    id: string,
    title: string
  ) => {
    startTransition(async () => {
      const res = await deleteListing(table, id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`"${title}" has been deleted.`);
      setDeleteDialogOpen(false);
      onOpenChange(false);
    });
  };

  const handleUnpublishListing = (
    table: "marketplace_listings" | "love_local_offers",
    id: string
  ) => {
    startTransition(async () => {
      const res = await unpublishListing(table, id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Listing has been unpublished from the mobile app.");
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[640px] data-[side=right]:sm:w-[640px] data-[side=right]:!max-w-[640px] p-0 flex flex-col h-full overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {item.type === "business" && (
            <BusinessContent
              business={item.data}
              onToggleOpen={() =>
                handleToggleOpen(item.data.id, item.data.is_open)
              }
              pending={pending}
            />
          )}

          {item.type === "marketplace" && (
            <MarketplaceContent
              listing={item.data}
              onUnpublish={() =>
                handleUnpublishListing("marketplace_listings", item.data.id)
              }
              pending={pending}
            />
          )}

          {item.type === "offer" && (
            <OfferContent
              offer={item.data}
              onUnpublish={() =>
                handleUnpublishListing("love_local_offers", item.data.id)
              }
              pending={pending}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t bg-muted/30 px-6 py-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="w-full sm:w-auto"
                disabled={pending}
              >
                <Trash2 className="size-4 mr-1.5" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[95vw] sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  {item.type === "business"
                    ? `This will permanently delete "${item.data.name}" and remove it from the Hello Linden mobile directory. This action cannot be undone.`
                    : `This will permanently delete "${item.data.title}". This action cannot be undone.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={pending}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.type === "business") {
                      handleDeleteBusiness(item.data.id, item.data.name);
                    } else if (item.type === "marketplace") {
                      handleDeleteListing(
                        "marketplace_listings",
                        item.data.id,
                        item.data.title
                      );
                    } else {
                      handleDeleteListing(
                        "love_local_offers",
                        item.data.id,
                        item.data.title
                      );
                    }
                  }}
                >
                  {pending ? "Deleting..." : "Yes, Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {item.type === "business" && (
              <Button asChild className="w-full sm:w-auto">
                <Link
                  href={`/listings/business/${item.data.id}`}
                  onClick={() => onOpenChange(false)}
                >
                  <Edit3 className="size-4 mr-1.5" />
                  Edit Full Details
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function BusinessContent({
  business,
  onToggleOpen,
  pending,
}: {
  business: BusinessRow;
  onToggleOpen: () => void;
  pending: boolean;
}) {
  const mapsUrl = business.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        business.address
      )}`
    : null;

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted border border-border">
        {business.image_url ? (
          <Image
            src={business.image_url}
            alt={business.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/10">
            <Store className="size-12 stroke-[1.25] text-emerald-600 mb-2" />
            <span className="text-xs font-medium">No cover image uploaded</span>
          </div>
        )}
      </div>

      {/* Header Info */}
      <SheetHeader className="p-0 space-y-2 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs font-semibold">
            {business.category}
          </Badge>
          <Button
            type="button"
            size="sm"
            variant={business.is_open ? "default" : "secondary"}
            className="h-7 text-xs gap-1.5"
            onClick={onToggleOpen}
            disabled={pending}
          >
            <Power className="size-3" />
            {business.is_open ? "Open Now" : "Closed"}
          </Button>
        </div>
        <SheetTitle className="text-2xl font-bold text-foreground">
          {business.name}
        </SheetTitle>
        <SheetDescription className="text-sm flex items-center gap-1.5 text-muted-foreground">
          <Star className="size-4 text-amber-500 fill-amber-500" />
          <span className="font-semibold text-foreground">
            {business.rating.toFixed(1)}
          </span>
          <span>({business.review_count} reviews)</span>
          <span className="mx-1">•</span>
          <span>Added {new Date(business.created_at).toLocaleDateString()}</span>
        </SheetDescription>
      </SheetHeader>

      <Separator />

      {/* Details Grid */}
      <div className="space-y-4">
        {/* Address */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
            <MapPin className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-muted-foreground">Location</div>
            <div className="text-sm font-medium text-foreground">
              {business.address || "No physical street address provided"}
            </div>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-1 font-medium"
              >
                <span>View on Google Maps</span>
                <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        </div>

        {/* Operating Hours */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
            <Clock className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-muted-foreground">Operating Hours</div>
            <div className="text-sm font-medium text-foreground">
              {business.hours || "Hours not specified"}
            </div>
          </div>
        </div>

        {/* GPS Coordinates */}
        {(business.latitude != null || business.longitude != null) && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
              <Globe className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-muted-foreground">Map Coordinates</div>
              <div className="text-xs font-mono text-foreground mt-0.5">
                {business.latitude ?? "—"}, {business.longitude ?? "—"}
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Description */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          About this Business
        </h4>
        <div className="p-4 rounded-xl bg-muted/40 border text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
          {business.description || "No public description provided for this business."}
        </div>
      </div>
    </div>
  );
}

function MarketplaceContent({
  listing,
  onUnpublish,
  pending,
}: {
  listing: ListingRow;
  onUnpublish: () => void;
  pending: boolean;
}) {
  return (
    <div className="space-y-6">
      {listing.image_url ? (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted border border-border">
          <Image
            src={listing.image_url}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      ) : (
        <div className="aspect-video w-full rounded-xl bg-muted/60 flex flex-col items-center justify-center text-muted-foreground border">
          <ShoppingBag className="size-12 stroke-[1.25] text-muted-foreground/60 mb-2" />
          <span className="text-xs">No listing photo</span>
        </div>
      )}

      <SheetHeader className="p-0 space-y-2 text-left">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="capitalize">
            {listing.category}
          </Badge>
          <Badge
            variant={
              listing.moderation_status === "approved"
                ? "secondary"
                : listing.moderation_status === "rejected"
                ? "outline"
                : "default"
            }
          >
            {listing.moderation_status}
          </Badge>
        </div>
        <SheetTitle className="text-xl font-bold">{listing.title}</SheetTitle>
        <div className="text-2xl font-bold text-emerald-600">{listing.price}</div>
      </SheetHeader>

      <Separator />

      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Listing Description
        </div>
        <div className="p-4 rounded-xl bg-muted/40 border text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
          {listing.description || "No description provided."}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span>Added {new Date(listing.created_at).toLocaleDateString()}</span>
        {listing.moderation_status !== "rejected" && (
          <Button
            variant="outline"
            size="sm"
            onClick={onUnpublish}
            disabled={pending}
            className="h-8"
          >
            Unpublish Listing
          </Button>
        )}
      </div>
    </div>
  );
}

function OfferContent({
  offer,
  onUnpublish,
  pending,
}: {
  offer: LoveLocalOfferRow;
  onUnpublish: () => void;
  pending: boolean;
}) {
  return (
    <div className="space-y-6">
      {offer.image_url ? (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted border border-border">
          <Image
            src={offer.image_url}
            alt={offer.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      ) : (
        <div className="aspect-video w-full rounded-xl bg-muted/60 flex flex-col items-center justify-center text-muted-foreground border">
          <Tag className="size-12 stroke-[1.25] text-muted-foreground/60 mb-2" />
          <span className="text-xs">No offer photo</span>
        </div>
      )}

      <SheetHeader className="p-0 space-y-2 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline">{offer.category}</Badge>
          {offer.is_special && (
            <Badge className="bg-amber-500 text-white gap-1">
              <Sparkles className="size-3" /> Special Deal
            </Badge>
          )}
        </div>
        <SheetTitle className="text-xl font-bold">{offer.title}</SheetTitle>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-emerald-600">
            {offer.offer_price || offer.price}
          </span>
          {offer.original_price && (
            <span className="text-base line-through text-muted-foreground">
              {offer.original_price}
            </span>
          )}
          {offer.discount && (
            <Badge variant="secondary" className="font-bold text-emerald-700">
              {offer.discount}
            </Badge>
          )}
        </div>
      </SheetHeader>

      <Separator />

      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Offer Details
        </div>
        <div className="p-4 rounded-xl bg-muted/40 border text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
          {offer.description || "No offer details provided."}
        </div>
      </div>

      {offer.expires_in && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="size-4 text-emerald-600" />
          <span>Valid until: <strong>{offer.expires_in}</strong></span>
        </div>
      )}

      {offer.address && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="size-4 text-emerald-600" />
          <span>Redeem at: {offer.address}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span>Added {new Date(offer.created_at).toLocaleDateString()}</span>
        {offer.moderation_status !== "rejected" && (
          <Button
            variant="outline"
            size="sm"
            onClick={onUnpublish}
            disabled={pending}
            className="h-8"
          >
            Unpublish Special
          </Button>
        )}
      </div>
    </div>
  );
}
