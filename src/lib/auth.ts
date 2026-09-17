import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPreviewMode } from "@/lib/preview-mode";

export interface AdminProfile {
  id: string;
  full_name: string | null;
  role: string;
  first_login_verified_at?: string | null;
}

const PREVIEW_ADMIN: AdminProfile = {
  id: "preview-admin",
  full_name: "Preview Admin",
  role: "admin",
  first_login_verified_at: new Date().toISOString(),
};

/**
 * Server-side admin gate. Call at the top of every protected page/layout.
 * Redirects to /login if unauthenticated, or /access-denied (after signing the
 * user out) if authenticated but not role='admin'. Short-circuits entirely in
 * preview mode — see src/lib/preview-mode.ts.
 */
export async function requireAdmin(): Promise<AdminProfile> {
  if (isPreviewMode) return PREVIEW_ADMIN;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, first_login_verified_at")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    redirect("/access-denied");
  }

  if (!profile.first_login_verified_at) {
    redirect("/verify-otp");
  }

  return profile;
}
