import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InboxItem } from "./types";

interface Props {
  item: InboxItem;
  isSelected: boolean;
  onClick: () => void;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

export function InboxItemRow({ item, isSelected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50",
        isSelected && "bg-muted"
      )}
    >
      <div className="flex items-center gap-2">
        <Avatar size="sm">
          <AvatarFallback>{initials(item.title)}</AvatarFallback>
        </Avatar>
        <span className={cn("flex-1 truncate text-sm", item.isNew && "font-semibold text-foreground")}>
          {item.title}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">{formatTimestamp(item.timestamp)}</span>
      </div>
      <div className="flex items-center gap-2 pl-8">
        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
        {item.badge && (
          <Badge variant={item.badge.variant ?? "outline"} className="h-4 px-1.5 text-[10px]">
            {item.badge.label}
          </Badge>
        )}
      </div>
      <p className="truncate pl-8 text-xs text-muted-foreground">{item.preview}</p>
    </button>
  );
}
