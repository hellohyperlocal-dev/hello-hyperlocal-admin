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

// Single source of truth for the sidebar. Add a new page here and it shows
// up in the nav automatically — no other file needs to change.
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/councillors", label: "Ward Councillors", icon: UserCheck },
  { href: "/registrations", label: "Registrations", icon: Inbox },
  { href: "/moderation", label: "Moderation", icon: ShieldCheck },
  { href: "/users", label: "Users", icon: Users },
  { href: "/listings", label: "Businesses & Listings", icon: Store },
  { href: "/ward-updates", label: "Ward Updates", icon: Megaphone },
  { href: "/admin-team", label: "Admin Team", icon: UserCog },
  { href: "/analytics", label: "Website traffic", icon: BarChart3 },
  { href: "/account", label: "Account", icon: Settings },
];
