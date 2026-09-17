"use server";

import { createHash, randomInt } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOtpEmail } from "@/lib/email";
import { logActivity } from "@/lib/activity-log";
import { isPreviewMode } from "@/lib/preview-mode";

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Fetches the currently-signed-in user; every action here assumes a session
 * already exists (password auth already succeeded — this is a gate in front
 * of the dashboard, not a replacement for session auth). */
async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requestLoginOtp(): Promise<{ error?: string }> {
  if (isPreviewMode) return {};

  const user = await getCurrentUser();
  if (!user?.email) return { error: "Not signed in." };

  const code = generateCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  const admin = createAdminClient();
  const { error } = await admin.from("admin_login_otps").insert({
    admin_id: user.id,
    code_hash: codeHash,
    expires_at: expiresAt,
  });

  if (error) {
    return { error: "Couldn't generate a verification code. Try again." };
  }

  await sendOtpEmail({ email: user.email, code });
  await logActivity(user.id, "login_otp.requested", "profiles", user.id, {});

  return {};
}

export async function verifyLoginOtp(code: string): Promise<{ error?: string }> {
  if (isPreviewMode) return {};

  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const admin = createAdminClient();
  const { data: otp, error: fetchError } = await admin
    .from("admin_login_otps")
    .select("id, code_hash, expires_at, consumed_at, attempts")
    .eq("admin_id", user.id)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError || !otp) {
    return { error: "No pending code found. Request a new one." };
  }

  if (new Date(otp.expires_at).getTime() < Date.now()) {
    return { error: "That code has expired. Request a new one." };
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    return { error: "Too many incorrect attempts. Request a new code." };
  }

  if (hashCode(code) !== otp.code_hash) {
    await admin
      .from("admin_login_otps")
      .update({ attempts: otp.attempts + 1 })
      .eq("id", otp.id);
    return { error: "Incorrect code." };
  }

  await admin.from("admin_login_otps").update({ consumed_at: new Date().toISOString() }).eq("id", otp.id);
  await admin.from("profiles").update({ first_login_verified_at: new Date().toISOString() }).eq("id", user.id);
  await logActivity(user.id, "login_otp.verified", "profiles", user.id, {});

  return {};
}
