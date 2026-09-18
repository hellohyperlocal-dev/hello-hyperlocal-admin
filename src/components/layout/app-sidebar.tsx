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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SignOutButton } from "@/components/sign-out-button";
import { HyperlocalLogo } from "@/components/hyperlocal-logo";
import { NAV_GROUPS } from "@/lib/nav-config";
import { isPreviewMode } from "@/lib/preview-mode";

interface Props {
  adminName: string;
  adminAvatarUrl?: string | null;
}

export function AppSidebar({ adminName, adminAvatarUrl }: Props) {
  const pathname = usePathname();

  const initials = adminName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "HL";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <HyperlocalLogo className="size-6 shrink-0" />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="font-heading text-sm font-bold tracking-tight text-sidebar-foreground leading-tight">
              Hello Hyperlocal
            </p>
            <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Admin Portal
            </p>
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
      <SidebarFooter className="gap-3 border-t border-sidebar-border/60 px-3 py-3 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2">
        <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
          <Avatar size="sm" className="border border-border/60">
            {adminAvatarUrl && <AvatarImage src={adminAvatarUrl} alt={adminName} />}
            <AvatarFallback className="text-[11px] font-semibold bg-[#1C472A] text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-medium text-sidebar-foreground">{adminName}</p>
          </div>
        </div>
        {!isPreviewMode && (
          <div className="group-data-[collapsible=icon]:hidden">
            <SignOutButton />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
