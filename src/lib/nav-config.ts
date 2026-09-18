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
    title: "Community & Content",
    items: [
      { href: "/registrations", label: "Registrations", icon: Inbox },
      { href: "/moderation", label: "Moderation", icon: ShieldCheck },
      { href: "/listings", label: "Businesses & Listings", icon: Store },
      { href: "/ward-updates", label: "Ward Updates", icon: Megaphone },
    ],
  },
  {
    title: "Directory & Team",
    items: [
      { href: "/users", label: "Users", icon: Users },
      { href: "/councillors", label: "Ward Councillors", icon: UserCheck },
      { href: "/admin-team", label: "Admin Team", icon: UserCog },
    ],
  },
  {
    title: "Settings",
    items: [{ href: "/account", label: "Account", icon: Settings }],
  },
];

// Flat list for header title lookup and backwards compatibility
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);
