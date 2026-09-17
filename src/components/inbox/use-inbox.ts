"use client";

import { useMemo, useState } from "react";
import type { InboxItem } from "./types";

type FilterTab = "all" | "new";

/**
 * Generic selection/filter/search state for the 3-pane inbox layout — ported
 * from the mail template's use-mail-app.ts, with its mail-specific two-tier
 * status/label split collapsed to one flat `activeCategory`, and "read/unread"
 * generalized to `isNew` (works for "unclaimed"/"pending"/whatever the caller
 * means by it).
 */
export function useInbox(items: InboxItem[], categories: { id: string }[]) {
  const [activeCategory, setActiveCategoryState] = useState<string>(categories[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const categoryItems = useMemo(
    () => (activeCategory === "all" ? items : items.filter((item) => item.categoryId === activeCategory)),
    [items, activeCategory]
  );

  const searched = useMemo(() => {
    if (!search.trim()) return categoryItems;
    const q = search.toLowerCase();
    return categoryItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.preview.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    );
  }, [categoryItems, search]);

  const filteredItems = useMemo(
    () => (filterTab === "new" ? searched.filter((item) => item.isNew) : searched),
    [searched, filterTab]
  );

  // Falls back to the first visible item if the previous selection isn't in
  // the current filtered view (category/search/tab changed) — same pattern
  // as use-mail-app.ts's selectedEmail derivation.
  const selectedItem = useMemo(() => {
    const found = filteredItems.find((item) => item.id === selectedId);
    return found ?? filteredItems[0] ?? null;
  }, [filteredItems, selectedId]);

  function setCategory(id: string) {
    setActiveCategoryState(id);
    setSelectedId(null);
  }

  function select(id: string) {
    setSelectedId(id);
  }

  const newCount = useMemo(() => categoryItems.filter((item) => item.isNew).length, [categoryItems]);

  return {
    activeCategory,
    setCategory,
    search,
    setSearch,
    filterTab,
    setFilterTab,
    selectedItem,
    select,
    filteredItems,
    newCount,
  };
}
