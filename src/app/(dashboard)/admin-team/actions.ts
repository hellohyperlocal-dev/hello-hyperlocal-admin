"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendInviteEmail } from "@/lib/email";
import { isPreviewMode } from "@/lib/preview-mode";
import { logActivity } from "@/lib/activity-log";
import { buildInviteLink } from "@/lib/invites";
import type { CreateInviteResult } from "../councillors/actions";

const INVITE_EXPIRY_DAYS = 7;

function generateToken(): string {
  return randomBytes(24).toString("hex");
}

export async function createAdminInvite(formData: FormData): Promise<CreateInviteResult> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();

  if (!name || !email) {
    return { error: "Name and email are both required." };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("invites")
    .insert({
      token,
      email,
      name,
      ward: "", // not applicable to admins; column is NOT NULL on the shared invites table
      role: "admin",
      invited_by: admin.id,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message || "Failed to create invite." };
  }

  const inviteLink = buildInviteLink(token, "admin");

  await logActivity(admin.id, "invite.created", "invites", data.id, { email, name, role: "admin" });
  await sendInviteEmail({ email, name, ward: "", role: "admin", inviteLink });

  revalidatePath("/admin-team");
  return { inviteLink };
}

/** Removes an active admin's access by demoting them to a resident, not a
 * hard delete — matches the pattern of "revoke" elsewhere (reversible,
 * auditable) rather than destroying the account. */
export async function removeAdminAccess(profileId: string): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };
  if (profileId === admin.id) return { error: "You can't remove your own admin access." };

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from("profiles").update({ role: "resident" }).eq("id", profileId);
  if (error) return { error: error.message };

  await logActivity(admin.id, "admin.access_removed", "profiles", profileId, {});
  revalidatePath("/admin-team");
  return {};
}
