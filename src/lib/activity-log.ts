import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Appends one row to admin_activity_log (service-role only, append-only —
 * see supabase/migrations/0003_admin_schema_additions.sql). Shared by every
 * admin Server Action that mutates something, so there's one consistent audit
 * trail shape across invites, moderation, login verification, etc.
 */
export async function logActivity(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, unknown>
) {
  const admin = createAdminClient();
  await admin.from("admin_activity_log").insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  });
}
