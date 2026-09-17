interface Props {
  title: string;
  subtitle: string;
  timestamp: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Generic detail-pane shell: header block + scrollable content + an optional
 * bottom action bar. The one reusable piece of the mail template's detail
 * pane — everything else there (reply/forward/labels/thread) was
 * email-specific and is intentionally not ported.
 *
 * Uses a plain overflow-y-auto div, not Radix ScrollArea — ScrollArea's
 * Viewport renders as display:table internally, which lets long content
 * grow past its container instead of wrapping/truncating (see inbox-list.tsx
 * for where this actually bit us).
 */
export function InboxDetailShell({ title, subtitle, timestamp, actions, children }: Props) {
  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="border-b border-border p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-foreground">{title}</h2>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleString("en-ZA")}
          </span>
        </div>
      </div>
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="min-w-0 p-6">{children}</div>
      </div>
      {actions && <div className="flex items-center gap-2 border-t border-border p-4">{actions}</div>}
    </div>
  );
}
