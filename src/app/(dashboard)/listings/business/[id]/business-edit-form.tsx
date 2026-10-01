"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { FileUploader } from "@/components/media/file-uploader";
import { BUSINESS_CATEGORIES } from "@/lib/listings-types";
import { updateBusiness, deleteBusiness } from "../../actions";
import {
  ArrowLeft,
  Save,
  Trash2,
  MapPin,
  Clock,
  Star,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { BusinessRow } from "@/lib/listings-types";

interface Props {
  business: BusinessRow;
}

export function BusinessEditForm({ business }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form state
  const [name, setName] = useState(business.name);
  const [category, setCategory] = useState<string>(business.category);
  const [address, setAddress] = useState(business.address || "");
  const [hours, setHours] = useState(business.hours || "");
  const [description, setDescription] = useState(business.description || "");
  const [isOpen, setIsOpen] = useState(business.is_open);
  const [rating, setRating] = useState(business.rating.toString());
  const [reviewCount, setReviewCount] = useState(business.review_count.toString());
  const [latitude, setLatitude] = useState(business.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(business.longitude?.toString() || "");
  const [imageUrl, setImageUrl] = useState(business.image_url || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Business name is required.");
      return;
    }

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("category", category);
    formData.set("address", address.trim());
    formData.set("hours", hours.trim());
    formData.set("description", description.trim());
    formData.set("isOpen", isOpen ? "true" : "false");
    formData.set("rating", rating);
    formData.set("reviewCount", reviewCount);
    if (latitude) formData.set("latitude", latitude);
    if (longitude) formData.set("longitude", longitude);
    if (imageUrl) formData.set("imageUrl", imageUrl);

    startTransition(async () => {
      const res = await updateBusiness(business.id, formData);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Business details updated successfully.");
      router.refresh();
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const res = await deleteBusiness(business.id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`"${business.name}" has been deleted.`);
      router.push("/listings");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Bar with Breadcrumbs & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="h-9">
            <Link href="/listings">
              <ArrowLeft className="size-4 mr-1.5" />
              Back to Listings
            </Link>
          </Button>
          <span className="text-muted-foreground text-sm hidden sm:inline">/</span>
          <span className="text-sm font-semibold truncate max-w-[200px] sm:max-w-xs">
            {business.name}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="submit"
            disabled={pending || deletePending}
            className="w-full sm:w-auto h-9"
          >
            <Save className="size-4 mr-1.5" />
            {pending ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Core Information</CardTitle>
              <CardDescription>
                Essential business profile displayed across the Hello Linden mobile app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Corner Bakery"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Business Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Select category" />
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

              <div className="space-y-2">
                <Label htmlFor="description">About / Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the business, offerings, ambiance, or neighborhood specialties..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location &amp; Operating Hours</CardTitle>
              <CardDescription>
                Physical storefront coordinates and opening times for resident navigation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Physical Street Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="address"
                    className="pl-9"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 44 4th Avenue, Linden, Randburg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">Operating Hours</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="hours"
                    className="pl-9"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="e.g. Mon–Fri 7am–5pm, Sat 8am–2pm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude (GPS)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="-26.1417"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude (GPS)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="27.9971"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Controls (1 Col) */}
        <div className="space-y-6">
          {/* Cover Photo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cover Photo</CardTitle>
              <CardDescription>
                High-resolution storefront or logo image. Stored on Cloudflare R2.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {imageUrl ? (
                <div className="space-y-3">
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                    <Image
                      src={imageUrl}
                      alt={name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 350px"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-destructive hover:bg-destructive/10"
                    onClick={() => setImageUrl("")}
                  >
                    Remove Photo
                  </Button>
                </div>
              ) : (
                <FileUploader
                  folder="business-listings"
                  maxFiles={1}
                  maxSizeMB={10}
                  onUploadComplete={(urls) => {
                    if (urls[0]) {
                      setImageUrl(urls[0]);
                      toast.success("Cover image uploaded.");
                    }
                  }}
                  onRemove={() => setImageUrl("")}
                />
              )}
            </CardContent>
          </Card>

          {/* Visibility & Ratings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status &amp; Ratings</CardTitle>
              <CardDescription>
                Operating status and seeded ratings in the directory.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Open for Business</Label>
                  <p className="text-xs text-muted-foreground">
                    Displays an &quot;Open Now&quot; badge on mobile.
                  </p>
                </div>
                <Switch checked={isOpen} onCheckedChange={setIsOpen} />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <div className="relative">
                    <Star className="absolute left-3 top-3 size-3.5 text-amber-500 fill-amber-500" />
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      className="pl-8"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviewCount">Review Count</Label>
                  <Input
                    id="reviewCount"
                    type="number"
                    min="0"
                    value={reviewCount}
                    onChange={(e) => setReviewCount(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-base text-destructive flex items-center gap-1.5">
                <AlertTriangle className="size-4" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-xs">
                Permanent deletion removes this business from search results and feeds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    disabled={deletePending || pending}
                  >
                    <Trash2 className="size-4 mr-1.5" />
                    Delete this Business
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[95vw] sm:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete &quot;{business.name}&quot;?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete this business listing and its
                      metadata from the Hello Linden database. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deletePending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deletePending}
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete();
                      }}
                    >
                      {deletePending ? "Deleting..." : "Yes, Delete Permanently"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
