"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";
import { isPreviewMode } from "@/lib/preview-mode";
import type { ModerationTable } from "@/lib/moderation";

export async function approveContent(table: ModerationTable, id: string): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from(table).update({ moderation_status: "approved" }).eq("id", id);
  if (error) return { error: error.message };

  await logActivity(admin.id, `${table}.approved`, table, id, {});
  revalidatePath("/moderation");
  return {};
}

export async function rejectContent(table: ModerationTable, id: string, reason: string): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };
  if (!reason.trim()) return { error: "A reason is required." };

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from(table)
    .update({ moderation_status: "rejected", rejection_reason: reason.trim() })
    .eq("id", id);
  if (error) return { error: error.message };

  await logActivity(admin.id, `${table}.rejected`, table, id, { reason: reason.trim() });
  revalidatePath("/moderation");
  return {};
}

export async function resolveReport(id: string, resolution: "resolved" | "dismissed"): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from("reports")
    .update({ status: resolution, resolved_by: admin.id, resolved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };

  await logActivity(admin.id, `report.${resolution}`, "reports", id, {});
  revalidatePath("/moderation");
  return {};
}

export async function createCommunityPost(formData: FormData): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "hood").trim();
  const content = String(formData.get("content") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;

  if (!title || !content) {
    return { error: "Title and content are required." };
  }

  const validCategories = ["event", "hood", "lost-found", "job", "recommendation", "business"];
  if (!validCategories.includes(category)) {
    return { error: "Invalid post category." };
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("community_posts")
    .insert({
      author_id: admin.id,
      title,
      category,
      content,
      image_url: imageUrl,
      is_pre_approved: true,
      moderation_status: "approved",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message || "Failed to create community post." };
  }

  await logActivity(admin.id, "community_post.created", "community_posts", data.id, {
    title,
    category,
  });

  revalidatePath("/moderation");
  return {};
}
