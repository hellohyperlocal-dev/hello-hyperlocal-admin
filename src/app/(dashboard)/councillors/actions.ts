"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendInviteEmail } from "@/lib/email";
import { isPreviewMode } from "@/lib/preview-mode";
import { logActivity } from "@/lib/activity-log";

import { buildInviteLink } from "@/lib/invites";

const INVITE_EXPIRY_DAYS = 7;

function generateToken(): string {
  return randomBytes(24).toString("hex");
}

export interface CreateInviteResult {
  error?: string;
  inviteLink?: string;
}

export async function createInvite(formData: FormData): Promise<CreateInviteResult> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const name = String(formData.get("name") || "").trim();
  const ward = String(formData.get("ward") || "").trim();
  const email = String(formData.get("email") || "").trim();

  if (!name || !ward || !email) {
    return { error: "Name, ward, and email are all required." };
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
      ward,
      role: "councillor",
      invited_by: admin.id,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message || "Failed to create invite." };
  }

  const inviteLink = buildInviteLink(token, "councillor");

  await logActivity(admin.id, "invite.created", "invites", data.id, { email, name, ward });
  await sendInviteEmail({ email, name, ward, role: "councillor", inviteLink });

  revalidatePath("/councillors");
  return { inviteLink };
}

export async function resendInvite(inviteId: string): Promise<CreateInviteResult> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };
  const supabaseAdmin = createAdminClient();

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("invites")
    .select("id, email, name, ward, role")
    .eq("id", inviteId)
    .single();

  if (fetchError || !existing) {
    return { error: "Invite not found." };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin
    .from("invites")
    .update({ token, expires_at: expiresAt, consumed_at: null, revoked_at: null })
    .eq("id", inviteId);

  if (error) {
    return { error: error.message };
  }

  const inviteRole = (existing.role as "councillor" | "admin") || "councillor";
  const inviteLink = buildInviteLink(token, inviteRole);

  await logActivity(admin.id, "invite.resent", "invites", inviteId, { email: existing.email });
  await sendInviteEmail({
    email: existing.email,
    name: existing.name,
    ward: existing.ward,
    role: existing.role as "councillor" | "admin",
    inviteLink,
  });

  revalidatePath("/councillors");
  return { inviteLink };
}

export async function revokeInvite(inviteId: string): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", inviteId);

  if (error) {
    return { error: error.message };
  }

  await logActivity(admin.id, "invite.revoked", "invites", inviteId, {});
  revalidatePath("/councillors");
  return {};
}

export async function createCouncillorAccount(formData: FormData): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const name = String(formData.get("name") || "").trim();
  const ward = String(formData.get("ward") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const phoneNumber = String(formData.get("phoneNumber") || "").trim();

  if (!name || !ward || !email || !password) {
    return { error: "Name, ward, email, and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabaseAdmin = createAdminClient();

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Failed to create councillor account." };
  }

  const councillorId = authData.user.id;

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: councillorId,
    role: "councillor",
    full_name: name,
    ward,
    phone_number: phoneNumber || null,
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(councillorId);
    return { error: profileError.message };
  }

  await logActivity(admin.id, "councillor.created", "profiles", councillorId, {
    email,
    name,
    ward,
  });

  revalidatePath("/councillors");
  return {};
}
