"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";
import { isPreviewMode } from "@/lib/preview-mode";
import { BUSINESS_CATEGORIES } from "@/lib/listings";

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
  const category = String(formData.get("category") || BUSINESS_CATEGORIES[0]).trim();
  const address = String(formData.get("address") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const hours = String(formData.get("hours") || "").trim() || null;
  const rating = Number(formData.get("rating") || 5.0);
  const isOpen = formData.get("isOpen") !== "false";
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;

  if (!name) return { error: "Business name is required." };

  if (!(BUSINESS_CATEGORIES as readonly string[]).includes(category)) {
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
  const category = String(formData.get("category") || BUSINESS_CATEGORIES[0]).trim();
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

export async function deleteBusiness(id: string): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const supabaseAdmin = createAdminClient();

  const { data: existing } = await supabaseAdmin
    .from("local_businesses")
    .select("name, category")
    .eq("id", id)
    .maybeSingle();

  // 1. Delete linked marketplace listings (e.g. mirrored listings)
  const { error: mpError } = await supabaseAdmin
    .from("marketplace_listings")
    .delete()
    .eq("business_id", id);

  if (mpError) {
    // If deletion is blocked, attempt to unlink
    await supabaseAdmin
      .from("marketplace_listings")
      .update({ business_id: null })
      .eq("business_id", id);
  }

  // 2. Delete linked Love Local specials for this business
  const { error: llError } = await supabaseAdmin
    .from("love_local_offers")
    .delete()
    .eq("business_id", id);

  if (llError) {
    // Fallback: unlink if delete fails
    await supabaseAdmin
      .from("love_local_offers")
      .update({ business_id: null })
      .eq("business_id", id);
  }

  // 3. Delete the local business record
  const { error } = await supabaseAdmin.from("local_businesses").delete().eq("id", id);
  if (error) return { error: error.message };

  await logActivity(admin.id, "business.deleted", "local_businesses", id, {
    name: existing?.name ?? "Unknown",
    category: existing?.category ?? "Unknown",
  });

  revalidatePath("/listings");
  revalidatePath("/");
  revalidatePath("/moderation");
  return {};
}

export async function updateBusiness(id: string, formData: FormData): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || BUSINESS_CATEGORIES[0]).trim();
  const address = String(formData.get("address") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const hours = String(formData.get("hours") || "").trim() || null;
  const rating = Number(formData.get("rating") || 5.0);
  const reviewCount = Number(formData.get("reviewCount") || 0);
  const isOpen = formData.get("isOpen") !== "false";
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;
  const latitude = formData.get("latitude") ? Number(formData.get("latitude")) : null;
  const longitude = formData.get("longitude") ? Number(formData.get("longitude")) : null;

  if (!name) return { error: "Business name is required." };

  if (!(BUSINESS_CATEGORIES as readonly string[]).includes(category)) {
    return { error: "Invalid business category." };
  }

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from("local_businesses")
    .update({
      name,
      category,
      address,
      description,
      hours,
      rating,
      review_count: reviewCount,
      is_open: isOpen,
      image_url: imageUrl,
      latitude,
      longitude,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await logActivity(admin.id, "business.updated", "local_businesses", id, { name, category });
  revalidatePath("/listings");
  revalidatePath(`/listings/business/${id}`);
  return {};
}

export async function toggleBusinessOpen(id: string, isOpen: boolean): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from("local_businesses")
    .update({ is_open: isOpen })
    .eq("id", id);

  if (error) return { error: error.message };

  await logActivity(admin.id, "business.toggled_open", "local_businesses", id, { is_open: isOpen });
  revalidatePath("/listings");
  revalidatePath(`/listings/business/${id}`);
  return {};
}

export async function deleteListing(table: ListingTable, id: string): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) return { error: error.message };

  await logActivity(admin.id, `${table}.deleted`, table, id, {});
  revalidatePath("/listings");
  return {};
}
