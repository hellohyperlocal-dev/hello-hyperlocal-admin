import { requireAdmin } from "@/lib/auth";
import { getModerationDashboardData } from "@/lib/moderation";
import { ModerationView } from "./components/moderation-view";

export const dynamic = "force-dynamic";

export default async function ContentModerationPage() {
  await requireAdmin();
  const data = await getModerationDashboardData();

  return <ModerationView initialData={data} />;
}
