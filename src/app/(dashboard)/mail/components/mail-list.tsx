"use client"

import type { ComponentProps } from "react"
import { formatDistanceToNow } from "date-fns"
import { Star, CheckCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Mail } from "../data"
import { useMail } from "../use-mail"

interface MailListProps {
  items: Mail[];
  onToggleStar?: (threadId: string, currentStarred: boolean) => void;
}

export function MailList({ items, onToggleStar }: MailListProps) {
  const [mail, setMail] = useMail();

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No messages found.
          </div>
        ) : (
          items.map((item) => {
            const isUnread = !item.read || item.status === "unread";
            const messageCount = item.messages?.length ?? 1;
            const lastMessage = item.messages && item.messages.length > 0
              ? item.messages[item.messages.length - 1]
              : null;
            const snippet = lastMessage?.body_text || item.text;

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                className={cn(
                  "hover:bg-accent hover:text-accent-foreground flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all cursor-pointer relative group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  mail.selected === item.id && "bg-muted border-primary/40",
                  isUnread && "bg-primary/[0.02] border-foreground/20 font-medium"
                )}
                onClick={() =>
                  setMail({
                    ...mail,
                    selected: item.id,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setMail({
                      ...mail,
                      selected: item.id,
                    });
                  }
                }}
              >
                <div className="flex w-full flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="font-semibold truncate text-xs sm:text-sm">
                        {item.name}
                      </div>
                      {messageCount > 1 && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded-md font-mono shrink-0">
                          {messageCount}
                        </span>
                      )}
                      {isUnread && (
                        <span className="flex size-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                      <button
                        type="button"
                        className={cn(
                          "size-5 p-0 flex items-center justify-center rounded hover:bg-muted text-muted-foreground/50 hover:text-foreground cursor-pointer transition-colors",
                          item.is_starred && "text-amber-500 fill-amber-500 hover:text-amber-600"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleStar) {
                            onToggleStar(item.id, Boolean(item.is_starred));
                          }
                        }}
                        title={item.is_starred ? "Unstar" : "Star"}
                      >
                        <Star className={cn("size-3.5", item.is_starred && "fill-amber-500 text-amber-500")} />
                        <span className="sr-only">Star</span>
                      </button>
                      <span
                        className={cn(
                          "text-[11px]",
                          mail.selected === item.id ? "text-foreground font-medium" : "text-muted-foreground"
                        )}
                      >
                        {formatMailDate(item.date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground truncate">
                      {item.subject}
                    </span>
                    {item.status === "replied" && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium shrink-0 ml-auto">
                        <CheckCheck className="size-3" />
                        Replied
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                  {snippet.substring(0, 300)}
                </div>
                {item.labels.length ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.labels.map((label) => (
                      <Badge key={label} variant={getBadgeVariantFromLabel(label)} className="text-[10px] py-0 px-1.5">
                        {label}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
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

