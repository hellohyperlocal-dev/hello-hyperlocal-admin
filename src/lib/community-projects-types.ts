export type ProjectCategory =
  | "Security & Safety"
  | "Parks & Greening"
  | "Solar & Power"
  | "Infrastructure"
  | "Municipal"
  | "Relief"
  | "Heritage"
  | "Security"
  | "Parks";

export type ProjectStatus = "active" | "funded" | "completed";

export interface CommunityProject {
  id: string;
  suburb_slug: string;
  title: string;
  description: string;
  category: string;
  target_amount: number;
  current_amount_raised: number;
  organizer_name: string;
  image_url: string | null;
  status: ProjectStatus;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  pledges_count?: number;
}

export type ContributionType =
  | "volunteer_time"
  | "donate_materials"
  | "professional_skills"
  | "financial_support"
  | "general_inquiry";

export type InquiryStatus = "new" | "contacted" | "connected";

export interface CommunityProjectInquiry {
  id: string;
  project_id: string | null;
  project_title: string;
  resident_name: string;
  phone: string;
  email: string;
  street_address: string | null;
  contribution_types: ContributionType[];
  message: string | null;
  profile_id: string | null;
  status: InquiryStatus;
  created_at: string;
}

export interface ProjectPledge {
  id: string;
  project_id: string;
  profile_id: string | null;
  resident_name: string;
  created_at: string;
}

export interface CommunityProjectsData {
  projects: CommunityProject[];
  inquiries: CommunityProjectInquiry[];
  pledges: ProjectPledge[];
}

export const PROJECT_CATEGORIES: { label: string; value: string; color: string }[] = [
  { label: "Security & Safety", value: "Security & Safety", color: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30" },
  { label: "Parks & Greening", value: "Parks & Greening", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  { label: "Solar & Power", value: "Solar & Power", color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  { label: "Infrastructure", value: "Infrastructure", color: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30" },
  { label: "Municipal", value: "Municipal", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30" },
  { label: "Relief", value: "Relief", color: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30" },
  { label: "Heritage", value: "Heritage", color: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30" },
];

export const CONTRIBUTION_TYPE_CONFIG: Record<
  ContributionType,
  { label: string; badgeClass: string }
> = {
  volunteer_time: {
    label: "Volunteer Time",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
  donate_materials: {
    label: "Materials / Tools",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  professional_skills: {
    label: "Professional Skills",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
  },
  financial_support: {
    label: "Financial Support",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
  },
  general_inquiry: {
    label: "General Info",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30",
  },
};
