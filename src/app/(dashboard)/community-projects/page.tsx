import { requireAdmin } from "@/lib/auth";
import { getCommunityProjectsData } from "@/lib/community-projects";
import { CommunityProjectsClient } from "./components/community-projects-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Community Projects | Hello Linden Admin",
  description:
    "Oversight, funding progress, and resident volunteer inquiry management for Linden.",
};

export default async function CommunityProjectsPage() {
  await requireAdmin();
  const { projects, inquiries } = await getCommunityProjectsData();

  return (
    <div className="min-w-0 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Community Projects
        </h1>
        <p className="text-sm text-muted-foreground">
          Oversight, funding progress, and resident volunteer inquiry management for Linden.
        </p>
      </div>

      <CommunityProjectsClient
        initialProjects={projects}
        initialInquiries={inquiries}
      />
    </div>
  );
}
