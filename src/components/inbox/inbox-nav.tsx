import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InboxCategory } from "./types";

interface Props {
  categories: InboxCategory[];
  activeCategory: string;
  onChange: (id: string) => void;
}

export function InboxNav({ categories, activeCategory, onChange }: Props) {
  return (
    <nav className="flex h-full flex-col gap-1 bg-muted/30 p-3">
      <p className="px-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Categories</p>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={category.id === activeCategory ? "secondary" : "ghost"}
          onClick={() => onChange(category.id)}
          className={cn(
            "h-9 justify-between px-3 text-sm",
            category.id === activeCategory && "font-medium"
          )}
        >
          <span className="truncate">{category.label}</span>
          {category.count > 0 && (
            <Badge variant={category.id === activeCategory ? "default" : "outline"} className="ml-2 shrink-0">
              {category.count}
            </Badge>
          )}
        </Button>
      ))}
    </nav>
  );
}
