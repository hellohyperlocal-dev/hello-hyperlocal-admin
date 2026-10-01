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

export async function deleteUser(id: string): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  if (admin.id === id) {
    return { error: "You cannot delete your own admin account." };
  }

  const supabaseAdmin = createAdminClient();

  // 1. Fetch user details for audit logging
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, business_name, role")
    .eq("id", id)
    .maybeSingle();

  const userName = profile?.full_name || profile?.business_name || "User";

  // 2. Cascade delete dependent content authored by this user
  // Marketplace listings
  await supabaseAdmin
    .from("marketplace_listings")
    .delete()
    .eq("author_id", id);

  // Love Local offers
  await supabaseAdmin
    .from("love_local_offers")
    .delete()
    .eq("author_id", id);

  // Community posts & their reports
  const { data: userPosts } = await supabaseAdmin
    .from("community_posts")
    .select("id")
    .eq("author_id", id);

  if (userPosts && userPosts.length > 0) {
    const postIds = userPosts.map((p) => p.id);
    await supabaseAdmin
      .from("reports")
      .delete()
      .in("post_id", postIds);

    await supabaseAdmin
      .from("community_posts")
      .delete()
      .eq("author_id", id);
  }

  // Reports filed by this user
  await supabaseAdmin
    .from("reports")
    .delete()
    .eq("reporter_id", id);

  // Event RSVPs by this user
  await supabaseAdmin
    .from("event_rsvps")
    .delete()
    .eq("user_id", id);

  // Unlink businesses owned by this user
  await supabaseAdmin
    .from("local_businesses")
    .update({ owner_id: null })
    .eq("owner_id", id);

  // Ward updates if councillor
  await supabaseAdmin
    .from("ward_updates")
    .delete()
    .eq("councillor_id", id);

  // 3. Delete profile record
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", id);

  if (profileError) {
    return { error: profileError.message };
  }

  // 4. Delete Supabase Auth account
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (authError) {
    console.error("Auth deletion note:", authError.message);
  }

  // 5. Audit log
  await logActivity(admin.id, "user.deleted", "profiles", id, {
    name: userName,
    role: profile?.role ?? "resident",
  });

  revalidatePath("/users");
  revalidatePath("/");
  revalidatePath("/analytics");
  return {};
}

