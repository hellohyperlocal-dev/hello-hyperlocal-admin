"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SignOutButton } from "@/components/sign-out-button";
import { NAV_GROUPS } from "@/lib/nav-config";
import { isPreviewMode } from "@/lib/preview-mode";

interface Props {
  adminName: string;
}

export function AppSidebar({ adminName }: Props) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
          <div className="size-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(126,217,87,0.6)]" />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Hello Linden
            </p>
            <p className="text-sm font-semibold text-sidebar-foreground leading-tight">Admin</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-2">
        {NAV_GROUPS.map((group, idx) => (
          <SidebarGroup key={group.title || idx} className="py-1">
            {group.title && (
              <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase group-data-[collapsible=icon]:hidden">
                {group.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        className={
                          isActive
                            ? "!bg-[#1C472A] !text-white hover:!bg-[#1C472A] hover:!text-white [&_svg]:!text-[#7ED957] font-medium shadow-2xs transition-colors"
                            : "text-sidebar-foreground/80 hover:bg-muted/70 hover:text-sidebar-foreground transition-colors"
                        }
                      >
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
        ))}
      </SidebarContent>
      <SidebarFooter className="gap-2 border-t border-sidebar-border/60 px-3 py-3 group-data-[collapsible=icon]:hidden">
        <p className="truncate text-xs text-muted-foreground">{adminName}</p>
        {!isPreviewMode && <SignOutButton />}
      </SidebarFooter>
    </Sidebar>
  );
}
