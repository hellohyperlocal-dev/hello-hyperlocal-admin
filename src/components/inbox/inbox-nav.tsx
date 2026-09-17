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
    <nav className="flex flex-col gap-1 p-2">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={category.id === activeCategory ? "secondary" : "ghost"}
          onClick={() => onChange(category.id)}
          className={cn("justify-between", category.id === activeCategory && "font-medium")}
        >
          <span>{category.label}</span>
          {category.count > 0 && (
            <Badge variant={category.id === activeCategory ? "default" : "outline"}>{category.count}</Badge>
          )}
        </Button>
      ))}
    </nav>
  );
}
