"use client";

import { useState } from "react";
import { Menu, ChevronLeft } from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInbox } from "./use-inbox";
import { InboxNav } from "./inbox-nav";
import { InboxList } from "./inbox-list";
import type { InboxCategory, InboxItem } from "./types";

interface Props {
  categories: InboxCategory[];
  items: InboxItem[];
  emptyState?: React.ReactNode;
}

export function InboxShell({ categories, items, emptyState }: Props) {
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [navOpen, setNavOpen] = useState(false);
  const inbox = useInbox(items, categories);

  const listPane = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border p-2">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setNavOpen(true)} aria-label="Categories">
            <Menu className="size-4" />
          </Button>
        )}
        <Input
          placeholder="Search…"
          value={inbox.search}
          onChange={(e) => inbox.setSearch(e.target.value)}
          className="h-8"
        />
      </div>
      <div className="px-2 pt-2">
        <Tabs value={inbox.filterTab} onValueChange={(v) => inbox.setFilterTab(v as "all" | "new")}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="new" className="flex-1">
              New{inbox.newCount > 0 ? ` (${inbox.newCount})` : ""}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 overflow-hidden">
        <InboxList
          items={inbox.filteredItems}
          selectedId={inbox.selectedItem?.id ?? null}
          onSelect={(id) => {
            inbox.select(id);
            if (isMobile) setMobileView("detail");
          }}
        />
      </div>
    </div>
  );

  const detailPane = inbox.selectedItem
    ? inbox.selectedItem.detail
    : (emptyState ?? <p className="p-6 text-center text-sm text-muted-foreground">Select an item to view it.</p>);

  if (isMobile) {
    return (
      <div className="h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-border">
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetContent side="left" className="w-64">
            <SheetTitle className="p-4">Categories</SheetTitle>
            <InboxNav
              categories={categories}
              activeCategory={inbox.activeCategory}
              onChange={(id) => {
                inbox.setCategory(id);
                setNavOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>
        {mobileView === "list" ? (
          listPane
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-1 border-b border-border p-2">
              <Button variant="ghost" size="icon" onClick={() => setMobileView("list")} aria-label="Back">
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Back to list</span>
            </div>
            <div className="flex-1 overflow-hidden">{detailPane}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-border"
    >
      <ResizablePanel defaultSize="15%" minSize="12%">
        <InboxNav categories={categories} activeCategory={inbox.activeCategory} onChange={inbox.setCategory} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="30%" minSize="22%">
        {listPane}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="55%" minSize="30%">
        {detailPane}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
