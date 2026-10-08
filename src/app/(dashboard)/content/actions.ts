"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";
import { isPreviewMode } from "@/lib/preview-mode";

export async function createCmsPost(formData: FormData): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const title = String(formData.get("title") || "").trim();
  const categoryRaw = String(formData.get("category") || "hood").trim().toLowerCase();
  const content = String(formData.get("content") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;
  const status = String(formData.get("status") || "published").trim().toLowerCase();
  const postType = String(formData.get("postType") || "community").trim().toLowerCase();

  if (!title) {
    return { error: "Post title is required." };
  }
  if (!content) {
    return { error: "Post content is required." };
  }

  // Map user-friendly category to database category
  let category = "hood";
  if (categoryRaw.includes("event")) category = "event";
  else if (categoryRaw.includes("lost") || categoryRaw.includes("found")) category = "lost-found";
  else if (categoryRaw.includes("deal") || categoryRaw.includes("business")) category = "business";
  else if (categoryRaw.includes("job")) category = "job";
  else if (categoryRaw.includes("recommend")) category = "recommendation";
  else if (categoryRaw.includes("ward") || categoryRaw.includes("alert")) category = "hood";

  const isDraft = status === "draft" || status === "drafts";
  const supabase = createAdminClient();

  const finalContent = excerpt && excerpt !== content ? `${excerpt}\n\n${content}` : content;

  if (postType === "ward alert" || postType === "ward") {
    const { data, error } = await supabase
      .from("ward_updates")
      .insert({
        councillor_id: admin.id,
        category: "notice",
        title,
        body: finalContent,
        ward: "Ward 99",
        is_pinned: formData.get("isPinned") === "true",
        image_url: imageUrl,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { error: error?.message || "Failed to create ward alert." };
    }

    await logActivity(admin.id, "ward_updates.created", "ward_updates", data.id, { title });
  } else {
    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        author_id: admin.id,
        title,
        category,
        content: finalContent,
        image_url: imageUrl,
        is_pre_approved: !isDraft,
        moderation_status: isDraft ? "pending" : "approved",
      })
      .select("id")
      .single();

    if (error || !data) {
      return { error: error?.message || "Failed to create post." };
    }

    await logActivity(admin.id, "community_post.created", "community_posts", data.id, {
      title,
      category,
      status: isDraft ? "draft" : "published",
    });
  }

  revalidatePath("/content");
  revalidatePath("/content/drafts");
  revalidatePath("/content/scheduled");
  revalidatePath("/moderation");
  revalidatePath("/");

  return {};
}

export async function deleteCmsPost(
  id: string,
  sourceTable: "community_posts" | "ward_updates"
): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const supabase = createAdminClient();
  const { error } = await supabase.from(sourceTable).delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await logActivity(admin.id, `${sourceTable}.deleted`, sourceTable, id, {});

  revalidatePath("/content");
  revalidatePath("/content/drafts");
  revalidatePath("/content/scheduled");
  revalidatePath("/moderation");
  revalidatePath("/");

  return {};
}
