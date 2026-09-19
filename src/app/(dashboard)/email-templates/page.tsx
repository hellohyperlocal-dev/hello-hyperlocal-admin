import { requireAdmin } from "@/lib/auth";
import { getUserEmail } from "@/lib/users";
import { EmailPreviewClient } from "./email-preview-client";
import { isPreviewMode } from "@/lib/preview-mode";

export default async function EmailTemplatesPage() {
  const admin = await requireAdmin();

  const adminEmail = isPreviewMode
    ? "preview@hellolinden.co.za"
    : (await getUserEmail(admin.id)) || "";

  return <EmailPreviewClient adminEmail={adminEmail} />;
}
