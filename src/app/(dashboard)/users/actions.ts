"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";
import { isPreviewMode } from "@/lib/preview-mode";

export async function suspendUser(id: string, reason: string): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };
  if (!reason.trim()) return { error: "A reason is required." };

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_suspended: true, suspended_at: new Date().toISOString(), suspended_reason: reason.trim() })
    .eq("id", id);
  if (error) return { error: error.message };

  await logActivity(admin.id, "user.suspended", "profiles", id, { reason: reason.trim() });
  revalidatePath("/users");
  return {};
}

export async function unsuspendUser(id: string): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_suspended: false, suspended_at: null, suspended_reason: null })
    .eq("id", id);
  if (error) return { error: error.message };

  await logActivity(admin.id, "user.unsuspended", "profiles", id, {});
  revalidatePath("/users");
  return {};
}
