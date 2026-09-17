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
