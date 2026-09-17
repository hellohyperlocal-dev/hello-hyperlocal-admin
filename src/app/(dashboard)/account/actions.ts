"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";
import { isPreviewMode } from "@/lib/preview-mode";

export async function updateOwnName(fullName: string): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };
  if (!fullName.trim()) return { error: "Name can't be empty." };

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from("profiles").update({ full_name: fullName.trim() }).eq("id", admin.id);
  if (error) return { error: error.message };

  await logActivity(admin.id, "account.name_updated", "profiles", admin.id, {});
  revalidatePath("/account");
  return {};
}
