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

export async function createUser(formData: FormData): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const role = String(formData.get("role") || "resident").trim();
  const businessName = String(formData.get("businessName") || "").trim();
  const phoneNumber = String(formData.get("phoneNumber") || "").trim();
  const streetAddress = String(formData.get("streetAddress") || "").trim();
  const ward = String(formData.get("ward") || "Ward 87").trim();

  if (!email || !password || !fullName) {
    return { error: "Full name, email, and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  if (!["resident", "business"].includes(role)) {
    return { error: "Invalid role selected." };
  }

  if (role === "business" && !businessName) {
    return { error: "Business name is required for business accounts." };
  }

  const supabaseAdmin = createAdminClient();

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Failed to create user account." };
  }

  const newUserId = authData.user.id;

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: newUserId,
    role,
    full_name: fullName,
    phone_number: phoneNumber || null,
    street_address: streetAddress || null,
    business_name: role === "business" ? businessName : null,
    ward: ward || null,
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    return { error: profileError.message };
  }

  await logActivity(admin.id, "user.created", "profiles", newUserId, {
    email,
    fullName,
    role,
    businessName: role === "business" ? businessName : undefined,
  });

  revalidatePath("/users");
  return {};
}
