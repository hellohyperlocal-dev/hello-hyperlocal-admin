"use client"

import type { ComponentProps } from "react"
import { formatDistanceToNow } from "date-fns"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Mail } from "../data"
import { useMail } from "../use-mail"

interface MailListProps {
  items: Mail[];
}

export function MailList({ items }: MailListProps) {
  const [mail, setMail] = useMail();

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No messages found.
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              className={cn(
                "hover:bg-accent hover:text-accent-foreground flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all cursor-pointer",
                mail.selected === item.id && "bg-muted"
              )}
              onClick={() =>
                setMail({
                  ...mail,
                  selected: item.id,
                })
              }
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{item.name}</div>
                    {!item.read && <span className="flex size-2 rounded-full bg-blue-600 cursor-pointer" />}
                  </div>
                  <div
                    className={cn(
                      "ml-auto text-xs",
                      mail.selected === item.id ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {formatMailDate(item.date)}
                  </div>
                </div>
                <div className="text-xs font-medium">{item.subject}</div>
              </div>
              <div className="text-muted-foreground line-clamp-2 text-xs">
                {item.text.substring(0, 300)}
              </div>
              {item.labels.length ? (
                <div className="flex items-center gap-2">
                  {item.labels.map((label) => (
                    <Badge key={label} variant={getBadgeVariantFromLabel(label)} className="cursor-pointer">
                      {label}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </button>
          ))
        )}
      </div>
    </ScrollArea>
  );
}

function formatMailDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "";
  }
}

function getBadgeVariantFromLabel(label: string): ComponentProps<typeof Badge>["variant"] {
  const l = label.toLowerCase();
  if (l.includes("business") || l.includes("work")) {
    return "default";
  }

  if (l.includes("neighbour") || l.includes("personal") || l.includes("linden")) {
    return "outline";
  }

  return "secondary";
}
