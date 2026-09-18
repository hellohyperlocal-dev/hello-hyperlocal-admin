"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { NAV_ITEMS } from "@/lib/nav-config";

export function AppHeader() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)));

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <span className="text-sm font-medium text-foreground">{current?.label ?? "Hello Hyperlocal"}</span>
      </div>
      <ModeToggle />
    </header>
  );
}
