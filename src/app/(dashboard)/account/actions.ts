"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";
import { isPreviewMode } from "@/lib/preview-mode";

export async function updateOwnProfile({
  fullName,
  avatarUrl,
}: {
  fullName?: string;
  avatarUrl?: string | null;
}): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const updates: Record<string, unknown> = {};
  if (fullName !== undefined) {
    if (!fullName.trim()) return { error: "Name can't be empty." };
    updates.full_name = fullName.trim();
  }
  if (avatarUrl !== undefined) {
    updates.avatar_url = avatarUrl;
  }

  if (Object.keys(updates).length === 0) return {};

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from("profiles").update(updates).eq("id", admin.id);
  if (error) return { error: error.message };

  await logActivity(admin.id, "account.profile_updated", "profiles", admin.id, updates);
  revalidatePath("/account");
  revalidatePath("/", "layout");
  return {};
}

export async function updateOwnName(fullName: string): Promise<{ error?: string }> {
  return updateOwnProfile({ fullName });
}
