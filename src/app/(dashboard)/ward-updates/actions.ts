"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";
import { isPreviewMode } from "@/lib/preview-mode";

export async function createWardUpdate(formData: FormData): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "notice").trim();
  const ward = String(formData.get("ward") || "Ward 87").trim();
  const body = String(formData.get("body") || "").trim();
  const isPinned = formData.get("isPinned") === "true";
  const councillorId = String(formData.get("councillorId") || "").trim() || admin.id;
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;

  if (!title || !body || !ward) {
    return { error: "Title, body, and ward are required." };
  }

  const validCategories = ["load-shedding", "water", "road-closure", "safety", "notice"];
  if (!validCategories.includes(category)) {
    return { error: "Invalid category selected." };
  }

  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("ward_updates")
    .insert({
      title,
      category,
      ward,
      body,
      is_pinned: isPinned,
      councillor_id: councillorId,
      image_url: imageUrl,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message || "Failed to create ward update." };
  }

  await logActivity(admin.id, "ward_update.created", "ward_updates", data.id, {
    title,
    category,
    ward,
    councillorId,
  });

  revalidatePath("/ward-updates");
  return {};
}
