"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";
import { isPreviewMode } from "@/lib/preview-mode";
import type { InquiryStatus, ProjectStatus } from "@/lib/community-projects-types";

export async function createProjectAction(formData: FormData): Promise<{
  success?: boolean;
  error?: string;
  id?: string;
}> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { success: true, id: "preview-id" };

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "Infrastructure").trim();
  const targetAmount = parseFloat(String(formData.get("target_amount") || "0"));
  const currentAmountRaised = parseFloat(
    String(formData.get("current_amount_raised") || "0")
  );
  const organizerName = String(
    formData.get("organizer_name") || "Linden Community Association"
  ).trim();
  const imageUrl = String(formData.get("image_url") || "").trim() || null;
  const status = (String(formData.get("status") || "active").trim()) as ProjectStatus;
  const deadlineRaw = String(formData.get("deadline") || "").trim();
  const deadline = deadlineRaw ? new Date(deadlineRaw).toISOString() : null;
  const suburbSlug = String(formData.get("suburb_slug") || "linden").trim();

  if (!title) {
    return { error: "Project title is required." };
  }
  if (!description) {
    return { error: "Project description is required." };
  }
  if (isNaN(targetAmount) || targetAmount <= 0) {
    return { error: "Target budget must be greater than R0." };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("community_projects")
    .insert({
      title,
      description,
      category,
      target_amount: targetAmount,
      current_amount_raised: isNaN(currentAmountRaised) ? 0 : currentAmountRaised,
      organizer_name: organizerName,
      image_url: imageUrl,
      status,
      deadline,
      suburb_slug: suburbSlug,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message || "Failed to create project." };
  }

  await logActivity(admin.id, "community_project.created", "community_projects", data.id, {
    title,
    category,
    target_amount: targetAmount,
  });

  revalidatePath("/community-projects");
  return { success: true, id: data.id };
}

export async function updateProjectAction(
  id: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { success: true };

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "Infrastructure").trim();
  const targetAmount = parseFloat(String(formData.get("target_amount") || "0"));
  const currentAmountRaised = parseFloat(
    String(formData.get("current_amount_raised") || "0")
  );
  const organizerName = String(
    formData.get("organizer_name") || "Linden Community Association"
  ).trim();
  const imageUrl = String(formData.get("image_url") || "").trim() || null;
  const status = (String(formData.get("status") || "active").trim()) as ProjectStatus;
  const deadlineRaw = String(formData.get("deadline") || "").trim();
  const deadline = deadlineRaw ? new Date(deadlineRaw).toISOString() : null;

  if (!title) {
    return { error: "Project title is required." };
  }
  if (!description) {
    return { error: "Project description is required." };
  }
  if (isNaN(targetAmount) || targetAmount <= 0) {
    return { error: "Target budget must be greater than R0." };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("community_projects")
    .update({
      title,
      description,
      category,
      target_amount: targetAmount,
      current_amount_raised: isNaN(currentAmountRaised) ? 0 : currentAmountRaised,
      organizer_name: organizerName,
      image_url: imageUrl,
      status,
      deadline,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  // Also update project_title snapshot in inquiries if title changed
  await supabase
    .from("community_project_inquiries")
    .update({ project_title: title })
    .eq("project_id", id);

  await logActivity(admin.id, "community_project.updated", "community_projects", id, {
    title,
    status,
    current_amount_raised: currentAmountRaised,
  });

  revalidatePath("/community-projects");
  return { success: true };
}

export async function deleteProjectAction(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { success: true };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("community_projects")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await logActivity(admin.id, "community_project.deleted", "community_projects", id, {});

  revalidatePath("/community-projects");
  return { success: true };
}

export async function updateInquiryStatusAction(
  id: string,
  status: InquiryStatus
): Promise<{ success?: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { success: true };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("community_project_inquiries")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await logActivity(
    admin.id,
    "community_project_inquiry.status_updated",
    "community_project_inquiries",
    id,
    { status }
  );

  revalidatePath("/community-projects");
  return { success: true };
}

export async function deleteInquiryAction(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { success: true };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("community_project_inquiries")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await logActivity(
    admin.id,
    "community_project_inquiry.deleted",
    "community_project_inquiries",
    id,
    {}
  );

  revalidatePath("/community-projects");
  return { success: true };
}
