import { createAdminClient } from "@/lib/supabase/admin";
import { isPreviewMode } from "@/lib/preview-mode";
import type {
  CommunityProject,
  CommunityProjectInquiry,
  ProjectPledge,
  CommunityProjectsData,
} from "./community-projects-types";

export const SAMPLE_PROJECTS: CommunityProject[] = [
  {
    id: "a1111111-1111-1111-1111-111111111111",
    suburb_slug: "linden",
    title: "Linden Park Solar Security Lighting",
    description:
      "Installing 12 solar-powered, motion-activated LED floodlights around Linden Park perimeter and walking paths to ensure resident safety during evening walks and loadshedding.",
    category: "Solar & Power",
    target_amount: 25000,
    current_amount_raised: 17500,
    organizer_name: "Linden Community Safety Forum",
    image_url:
      "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80",
    status: "active",
    deadline: "2026-11-30T23:59:59Z",
    created_at: "2026-11-04T01:57:57.965Z",
    updated_at: "2026-11-04T01:57:57.965Z",
    pledges_count: 14,
  },
  {
    id: "b2222222-2222-2222-2222-222222222222",
    suburb_slug: "linden",
    title: "4th Avenue CCTV License Plate Camera",
    description:
      "Adding high-definition LPR (License Plate Recognition) security camera at the 4th Ave & 7th St intersection, integrated with Linden Security patrol units.",
    category: "Security & Safety",
    target_amount: 40000,
    current_amount_raised: 32000,
    organizer_name: "Linden CPF Sub-Forum",
    image_url:
      "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80",
    status: "active",
    deadline: "2026-12-15T23:59:59Z",
    created_at: "2026-11-04T01:57:57.965Z",
    updated_at: "2026-11-04T01:57:57.965Z",
    pledges_count: 22,
  },
  {
    id: "c3333333-3333-3333-3333-333333333333",
    suburb_slug: "linden",
    title: "Linden Botanical Corner & Tree Planting",
    description:
      "Greening initiative to plant 30 indigenous Acacia and White Stinkwood trees along 3rd Street sidewalk, including recycled benches and drip irrigation.",
    category: "Parks & Greening",
    target_amount: 15000,
    current_amount_raised: 15000,
    organizer_name: "Linden Greening Team",
    image_url:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
    status: "funded",
    deadline: "2026-12-31T23:59:59Z",
    created_at: "2026-11-04T01:57:57.965Z",
    updated_at: "2026-11-04T01:57:57.965Z",
    pledges_count: 31,
  },
];

export const SAMPLE_INQUIRIES: CommunityProjectInquiry[] = [
  {
    id: "inq-1",
    project_id: "a1111111-1111-1111-1111-111111111111",
    project_title: "Linden Park Solar Security Lighting",
    resident_name: "David Malan",
    phone: "+27 82 456 7890",
    email: "david.malan@example.co.za",
    street_address: "5th Street, Linden",
    contribution_types: ["volunteer_time", "professional_skills"],
    message:
      "Qualified electrician living nearby. Happy to donate 2 Saturday mornings to assist with pole mounting and cabling.",
    profile_id: null,
    status: "new",
    created_at: "2026-11-10T14:32:00Z",
  },
  {
    id: "inq-2",
    project_id: "c3333333-3333-3333-3333-333333333333",
    project_title: "Linden Botanical Corner & Tree Planting",
    resident_name: "Anke van der Merwe",
    phone: "083 234 5678",
    email: "anke.vdm@example.co.za",
    street_address: "Corner 4th & 7th",
    contribution_types: ["donate_materials", "volunteer_time"],
    message:
      "I have compost bags and 6 indigenous saplings from our nursery. Can drop off anytime this week.",
    profile_id: null,
    status: "contacted",
    created_at: "2026-11-09T09:15:00Z",
  },
  {
    id: "inq-3",
    project_id: "b2222222-2222-2222-2222-222222222222",
    project_title: "4th Avenue CCTV License Plate Camera",
    resident_name: "Johan Swart",
    phone: "+27 82 999 1122",
    email: "johan@swartlaw.co.za",
    street_address: "4th Avenue",
    contribution_types: ["financial_support"],
    message:
      "Our firm would like to sponsor R5,000 towards the camera enclosure. Please send official banking/PBO invoice details.",
    profile_id: null,
    status: "connected",
    created_at: "2026-11-08T16:40:00Z",
  },
];

export async function getCommunityProjectsData(): Promise<CommunityProjectsData> {
  if (isPreviewMode) {
    return {
      projects: SAMPLE_PROJECTS,
      inquiries: SAMPLE_INQUIRIES,
      pledges: [],
    };
  }

  const supabase = createAdminClient();

  const [projectsRes, inquiriesRes, pledgesRes] = await Promise.all([
    supabase
      .from("community_projects")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("community_project_inquiries")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("project_pledges")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  if (projectsRes.error) {
    console.error("Error fetching community projects:", projectsRes.error);
  }
  if (inquiriesRes.error) {
    console.error("Error fetching inquiries:", inquiriesRes.error);
  }

  const pledges = (pledgesRes.data as ProjectPledge[]) || [];

  // Calculate pledges count per project
  const pledgeCountMap: Record<string, number> = {};
  for (const pledge of pledges) {
    if (pledge.project_id) {
      pledgeCountMap[pledge.project_id] =
        (pledgeCountMap[pledge.project_id] || 0) + 1;
    }
  }

  const rawProjects = (projectsRes.data as CommunityProject[]) || [];
  const projects: CommunityProject[] = rawProjects.map((p) => ({
    ...p,
    target_amount: Number(p.target_amount) || 0,
    current_amount_raised: Number(p.current_amount_raised) || 0,
    pledges_count: pledgeCountMap[p.id] || 0,
  }));

  const inquiries = (inquiriesRes.data as CommunityProjectInquiry[]) || [];

  return {
    projects,
    inquiries,
    pledges,
  };
}
