import { requireAdmin } from "@/lib/auth";
import { getContentData } from "@/lib/content";
import { ContentView } from "../components/content-view";

export const dynamic = "force-dynamic";

export default async function DraftsPage() {
  const admin = await requireAdmin();
  const { posts, stats } = await getContentData();

  return (
    <ContentView
      posts={posts}
      stats={stats}
      initialTab="Drafts"
      adminName={admin.full_name || "JC Steyn"}
    />
  );
}
