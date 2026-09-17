import { ScrollArea } from "@/components/ui/scroll-area";
import { InboxItemRow } from "./inbox-item";
import type { InboxItem } from "./types";

interface Props {
  items: InboxItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function InboxList({ items, selectedId, onSelect }: Props) {
  if (items.length === 0) {
    return <p className="p-6 text-center text-sm text-muted-foreground">Nothing here.</p>;
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-1 p-2">
        {items.map((item) => (
          <InboxItemRow key={item.id} item={item} isSelected={item.id === selectedId} onClick={() => onSelect(item.id)} />
        ))}
      </div>
    </ScrollArea>
  );
}
