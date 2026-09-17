import { ScrollArea } from "@/components/ui/scroll-area";

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
 */
export function InboxDetailShell({ title, subtitle, timestamp, actions, children }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleString("en-ZA")}
          </span>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">{children}</div>
      </ScrollArea>
      {actions && <div className="flex items-center gap-2 border-t border-border p-4">{actions}</div>}
    </div>
  );
}
