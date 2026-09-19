"use client";

import * as React from "react";
import Link from "next/link";
import { BellIcon, ShieldAlertIcon, UserPlusIcon, FlagIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminAlert } from "@/lib/alerts";

interface NotificationBellProps {
  alerts: AdminAlert[];
  count: number;
}

export function NotificationBell({ alerts, count }: NotificationBellProps) {
  const iconForType = (type: AdminAlert["type"]) => {
    switch (type) {
      case "moderation":
        return <ShieldAlertIcon className="size-4 text-warning" />;
      case "report":
        return <FlagIcon className="size-4 text-destructive" />;
      case "registration":
        return <UserPlusIcon className="size-4 text-primary" />;
      default:
        return <BellIcon className="size-4 text-primary" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative rounded-full hover:bg-muted/70"
          aria-label="Notifications"
        >
          <BellIcon className="size-4 text-foreground/80" />
          {count > 0 && (
            <span className="absolute top-1 right-1 flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-2 sm:w-96">
        <div className="flex items-center justify-between px-2 py-1.5">
          <p className="font-heading text-sm font-semibold text-foreground">Notifications &amp; Alerts</p>
          {count > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {count} new
            </span>
          )}
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuGroup className="space-y-1">
          {alerts.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              All caught up! No pending moderation or alerts.
            </div>
          ) : (
            alerts.map((alert) => (
              <DropdownMenuItem key={alert.id} asChild className="cursor-pointer rounded-xl p-2.5">
                <Link href={alert.href} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted border border-border/60">
                    {iconForType(alert.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate text-xs font-semibold text-foreground">{alert.title}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{alert.timeAgo}</span>
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground mt-0.5">{alert.description}</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer justify-center text-xs font-medium text-primary">
          <Link href="/moderation" className="flex items-center gap-1.5 py-1">
            <span>Open moderation queue</span>
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
