"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";
import { isPreviewMode } from "@/lib/preview-mode";

export async function acceptAdminInvite({
  token,
  password,
}: {
  token: string;
  password?: string;
}): Promise<{ error?: string; success?: boolean }> {
  if (isPreviewMode) return { error: "Preview mode — no changes are saved here." };

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const supabaseAdmin = createAdminClient();

  // 1. Fetch invite
  const { data: invite, error: inviteError } = await supabaseAdmin
    .from("invites")
    .select("id, token, email, name, role, expires_at, consumed_at, revoked_at")
    .eq("token", token)
    .single();

  if (inviteError || !invite) {
    return { error: "Invalid or expired invite token." };
  }

  if (invite.revoked_at) {
    return { error: "This invite has been revoked." };
  }

  if (invite.consumed_at) {
    return { error: "This invite has already been accepted. Please sign in." };
  }

  if (new Date(invite.expires_at) < new Date()) {
    return { error: "This invite has expired. Please request a new invite." };
  }

  if (invite.role !== "admin") {
    return { error: "This invite is for the mobile app, not the web admin dashboard." };
  }

  // 2. Check if auth user already exists for this email
  const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = userList?.users?.find(
    (u) => u.email?.toLowerCase() === invite.email.toLowerCase()
  );

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { full_name: invite.name },
    });
    if (updateError) {
      return { error: updateError.message };
    }
  } else {
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: invite.name },
    });
    if (createError || !newUser.user) {
      return { error: createError?.message || "Failed to create user account." };
    }
    userId = newUser.user.id;
  }

  // 3. Upsert profile as admin with first_login_verified_at set
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: userId,
    role: "admin",
    full_name: invite.name,
    first_login_verified_at: new Date().toISOString(),
  });

  if (profileError) {
    return { error: profileError.message };
  }

  // 4. Mark invite as consumed
  await supabaseAdmin
    .from("invites")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", invite.id);

  // 5. Log activity
  await logActivity(userId, "admin.invite_accepted", "invites", invite.id, {
    email: invite.email,
    name: invite.name,
  });

  return { success: true };
}
