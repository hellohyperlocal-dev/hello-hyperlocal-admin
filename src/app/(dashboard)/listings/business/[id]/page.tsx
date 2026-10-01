import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getBusinessById } from "@/lib/listings";
import { isPreviewMode } from "@/lib/preview-mode";
import { BusinessEditForm } from "./business-edit-form";
import type { BusinessRow } from "@/lib/listings-types";

interface Props {
  params: Promise<{ id: string }>;
}

const SAMPLE_BUSINESS: BusinessRow = {
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
};

export default async function BusinessEditPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  let business: BusinessRow | null = null;

  if (isPreviewMode) {
    business = { ...SAMPLE_BUSINESS, id };
  } else {
    business = await getBusinessById(id);
  }

  if (!business) {
    notFound();
  }

  return (
    <div className="min-w-0 max-w-3xl mx-auto space-y-6 pb-16">
      <BusinessEditForm business={business} />
    </div>
  );
}
