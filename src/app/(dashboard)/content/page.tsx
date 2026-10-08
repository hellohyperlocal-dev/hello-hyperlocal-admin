import { requireAdmin } from "@/lib/auth";
import { getContentData } from "@/lib/content";
import { ContentView } from "./components/content-view";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  await requireAdmin();
  const { posts, stats } = await getContentData();

  return <ContentView posts={posts} stats={stats} initialTab="All Posts" />;
}
