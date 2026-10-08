import { requireAdmin } from "@/lib/auth";
import { getWardUpdatesDashboardData } from "@/lib/ward-updates";
import { WardUpdatesView } from "./components/ward-updates-view";

export const dynamic = "force-dynamic";

export default async function ContentWardUpdatesPage() {
  await requireAdmin();
  const data = await getWardUpdatesDashboardData();

  return <WardUpdatesView initialData={data} />;
}
