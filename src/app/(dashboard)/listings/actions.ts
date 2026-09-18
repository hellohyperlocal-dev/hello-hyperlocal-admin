"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";
import { isPreviewMode } from "@/lib/preview-mode";

type ListingTable = "marketplace_listings" | "love_local_offers";

export async function unpublishListing(table: ListingTable, id: string): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from(table).update({ moderation_status: "rejected" }).eq("id", id);
  if (error) return { error: error.message };

  await logActivity(admin.id, `${table}.unpublished`, table, id, {});
  revalidatePath("/listings");
  return {};
}

export async function createBusiness(formData: FormData): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "Restaurants").trim();
  const address = String(formData.get("address") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const hours = String(formData.get("hours") || "").trim() || null;
  const rating = Number(formData.get("rating") || 5.0);
  const isOpen = formData.get("isOpen") !== "false";
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;

  if (!name) return { error: "Business name is required." };

  const validCategories = ["Restaurants", "Coffee Shops", "Retail", "Guesthouses", "Markets", "Experiences"];
  if (!validCategories.includes(category)) {
    return { error: "Invalid business category." };
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("local_businesses")
    .insert({
      name,
      category,
      address,
      description,
      hours,
      rating,
      is_open: isOpen,
      image_url: imageUrl,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message || "Failed to create business." };

  await logActivity(admin.id, "business.created", "local_businesses", data.id, { name, category });
  revalidatePath("/listings");
  return {};
}

export async function createMarketplaceListing(formData: FormData): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "for-sale").trim();
  const price = String(formData.get("price") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const tier = String(formData.get("tier") || "photo").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;

  if (!title || !price) return { error: "Title and price are required." };

  const validCategories = ["services", "for-sale", "stays"];
  if (!validCategories.includes(category)) return { error: "Invalid marketplace category." };

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("marketplace_listings")
    .insert({
      author_id: admin.id,
      title,
      category,
      price,
      description,
      tier,
      image_url: imageUrl,
      is_pre_approved: true,
      moderation_status: "approved",
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message || "Failed to create listing." };

  await logActivity(admin.id, "marketplace_listing.created", "marketplace_listings", data.id, { title, price, category });
  revalidatePath("/listings");
  return {};
}

export async function createLoveLocalOffer(formData: FormData): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "Restaurants").trim();
  const price = String(formData.get("price") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const isSpecial = formData.get("isSpecial") === "true";
  const discount = String(formData.get("discount") || "").trim() || null;
  const originalPrice = String(formData.get("originalPrice") || "").trim() || null;
  const offerPrice = String(formData.get("offerPrice") || "").trim() || null;
  const expiresIn = String(formData.get("expiresIn") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;

  if (!title || !price) return { error: "Title and price are required." };

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("love_local_offers")
    .insert({
      author_id: admin.id,
      title,
      category,
      tier: imageUrl ? "photo" : "text",
      price,
      description,
      is_special: isSpecial,
      discount,
      original_price: originalPrice,
      offer_price: offerPrice,
      expires_in: expiresIn,
      address,
      image_url: imageUrl,
      moderation_status: "approved",
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message || "Failed to create offer." };

  await logActivity(admin.id, "love_local_offer.created", "love_local_offers", data.id, { title, price, category });
  revalidatePath("/listings");
  return {};
}
