import { requireAdmin } from "@/lib/auth";
import { getDesignerTemplatesAction } from "@/lib/email-designer/actions";
import { TemplatesDashboardClient } from "./components/templates-dashboard-client";

export const dynamic = "force-dynamic";

export default async function EmailDesignerPage() {
  await requireAdmin();
  const res = await getDesignerTemplatesAction();

  return <TemplatesDashboardClient initialTemplates={res.templates || []} />;
}
