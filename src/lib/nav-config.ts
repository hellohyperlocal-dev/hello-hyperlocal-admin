import {
  LayoutDashboard,
  Users,
  UserCheck,
  BarChart3,
  Inbox,
  ShieldCheck,
  UserCog,
  Store,
  Megaphone,
  Settings,
  Mail,
  FileText,
  Archive,
  Clock3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

// Single source of truth for the sidebar. Grouped logically by function.
export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/analytics", label: "Website traffic", icon: BarChart3 },
    ],
  },
  {
    title: "Apps",
    items: [
      { href: "/mail", label: "Mail", icon: Mail },
    ],
  },
  {
    title: "Community",
    items: [
      { href: "/registrations", label: "Registrations", icon: Inbox },
      { href: "/listings", label: "Businesses & Listings", icon: Store },
      { href: "/users", label: "Users", icon: Users },
    ],
  },
  {
    title: "Content Studio",
    items: [
      { href: "/content", label: "All Posts", icon: FileText },
      { href: "/content/drafts", label: "Drafts", icon: Archive },
      { href: "/content/scheduled", label: "Scheduled", icon: Clock3 },
      { href: "/content/ward-updates", label: "Ward Updates", icon: Megaphone },
      { href: "/content/moderation", label: "Moderation", icon: ShieldCheck },
    ],
  },
  {
    title: "Directory & Team",
    items: [
      { href: "/councillors", label: "Ward Councillors", icon: UserCheck },
      { href: "/admin-team", label: "Admin Team", icon: UserCog },
    ],
  },
  {
    title: "Settings & System",
    items: [
      { href: "/email-templates", label: "Email Templates", icon: Mail },
      { href: "/account", label: "Account", icon: Settings },
    ],
  },
];

// Flat list for header title lookup and backwards compatibility
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);
