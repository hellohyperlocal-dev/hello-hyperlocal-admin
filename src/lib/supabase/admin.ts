import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS entirely. Server-only (Server Actions / Route
 * Handlers), and never imported into a client component (the `server-only` import
 * above makes that a build-time error, not just a convention).
 *
 * Used for exactly the things RLS deliberately blocks the anon key from doing:
 * reading/writing `invites` and `reports` (zero public policies by design),
 * promoting a profile's role, and writing `admin_activity_log` rows.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
