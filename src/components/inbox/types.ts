export interface InboxItem {
  id: string;
  categoryId: string; // matches an InboxCategory.id — used for nav filtering, not displayed directly
  title: string;
  subtitle: string; // human-readable, shown in the list row (e.g. a category label)
  preview: string;
  timestamp: string;
  isNew: boolean;
  badge?: { label: string; variant?: "default" | "secondary" | "destructive" | "outline" };
  // Pre-rendered detail-pane content. InboxShell is a Client Component, so a
  // render function computed in a Server Component page can't be passed to
  // it directly (only Server Actions/serializable data cross that boundary)
  // — instead each item carries its own already-rendered JSX.
  detail: React.ReactNode;
}

/** Shape returned by server-side data-fetching helpers, before the page
 * attaches each item's rendered detail-pane JSX. */
export type InboxItemInput = Omit<InboxItem, "detail">;

export interface InboxCategory {
  id: string;
  label: string;
  count: number;
}
