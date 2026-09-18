"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { NAV_ITEMS } from "@/lib/nav-config";
import type { AdminAlert } from "@/lib/alerts";

interface AppHeaderProps {
  alerts?: AdminAlert[];
  alertCount?: number;
}

export function AppHeader({ alerts = [], alertCount = 0 }: AppHeaderProps) {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)));

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <span className="font-heading text-sm font-semibold text-foreground">{current?.label ?? "Hello Hyperlocal"}</span>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell alerts={alerts} count={alertCount} />
        <ModeToggle />
      </div>
    </header>
  );
}
