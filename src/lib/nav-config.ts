import { LayoutDashboard, Users, BarChart3, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Single source of truth for the sidebar. Add a new page here and it shows
// up in the nav automatically — no other file needs to change.
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/councillors", label: "Ward Councillors", icon: Users },
  { href: "/analytics", label: "Website traffic", icon: BarChart3 },
];
