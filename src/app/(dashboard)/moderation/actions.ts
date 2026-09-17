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
