"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SignOutButton } from "@/components/sign-out-button";
import { NAV_ITEMS } from "@/lib/nav-config";
import { isPreviewMode } from "@/lib/preview-mode";

interface Props {
  adminName: string;
}

export function AppSidebar({ adminName }: Props) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4 group-data-[collapsible=icon]:px-2">
        <p className="text-xs font-semibold tracking-wide text-accent-foreground uppercase group-data-[collapsible=icon]:hidden">
          Hello Linden
        </p>
        <p className="text-sm font-medium text-sidebar-foreground group-data-[collapsible=icon]:hidden">Admin</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-2 px-3 pb-3 group-data-[collapsible=icon]:hidden">
        <p className="truncate text-xs text-muted-foreground">{adminName}</p>
        {!isPreviewMode && <SignOutButton />}
      </SidebarFooter>
    </Sidebar>
  );
}
