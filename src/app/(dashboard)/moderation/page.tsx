import { getModerationQueue, MODERATION_CATEGORIES, type ModerationDetail, type ReportDetail } from "@/lib/moderation";
import { isPreviewMode } from "@/lib/preview-mode";
import { InboxShell } from "@/components/inbox/inbox-shell";
import { InboxDetailShell } from "@/components/inbox/inbox-detail-shell";
import { ContentActions, ReportActions } from "./moderation-actions";
import type { InboxItem, InboxItemInput } from "@/components/inbox/types";

const SAMPLE_ITEMS: InboxItemInput[] = [
  {
    id: "sample-post",
    categoryId: "community_posts",
    title: "Load shedding schedule for Linden",
    subtitle: "Community Posts",
    preview: "Sharing the updated schedule for our area this week...",
    timestamp: new Date().toISOString(),
    isNew: true,
    badge: { label: "Pending", variant: "outline" },
  },
];

export default async function ModerationPage() {
  if (isPreviewMode) {
    const items: InboxItem[] = SAMPLE_ITEMS.map((item) => ({
      ...item,
      detail: (
        <InboxDetailShell
          title={item.title}
          subtitle={item.subtitle}
          timestamp={item.timestamp}
          actions={<p className="text-xs text-muted-foreground">Preview mode — no changes are saved here.</p>}
        >
          <p className="text-sm text-foreground">{item.preview}</p>
        </InboxDetailShell>
      ),
    }));
    return (
      <div className="min-w-0 space-y-4">
        <PageHeader />
        <InboxShell
          categories={MODERATION_CATEGORIES.map((c) => ({
            id: c.id,
            label: c.label,
            count: items.filter((i) => i.categoryId === c.id).length,
          }))}
          items={items}
        />
      </div>
    );
  }

  const { categories, items: rawItems, byId } = await getModerationQueue();
  const items: InboxItem[] = rawItems.map((item) => {
    const detail = byId.get(item.id);
    if (!detail) return { ...item, detail: null };
    return {
      ...item,
      detail:
        detail.kind === "report" ? (
          <ReportDetailView item={item} detail={detail} />
        ) : (
          <ContentDetailView item={item} detail={detail} />
        ),
    };
  });

  return (
    <div className="min-w-0 space-y-4">
      <PageHeader />
      <InboxShell categories={categories} items={items} />
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Moderation</h1>
      <p className="text-sm text-muted-foreground">
        Pending content and open reports. Marketplace and Love Local stay empty until those forms are wired to
        Supabase in the mobile app.
      </p>
    </div>
  );
}

function ContentDetailView({ item, detail }: { item: InboxItemInput; detail: ModerationDetail }) {
  return (
    <InboxDetailShell
      title={item.title}
      subtitle={item.subtitle}
      timestamp={item.timestamp}
      actions={<ContentActions table={detail.table} id={detail.row.id} />}
    >
      <div className="min-w-0 space-y-3">
        {detail.row.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={detail.row.image_url} alt="" className="max-h-80 w-full max-w-full rounded-md object-cover" />
        )}
        <p className="text-sm whitespace-pre-wrap break-words text-foreground">
          {detail.row.content || detail.row.description}
        </p>
        {detail.row.price && <p className="text-sm text-muted-foreground">Price: {detail.row.price}</p>}
        <p className="text-xs text-muted-foreground">Category: {detail.row.category}</p>
      </div>
    </InboxDetailShell>
  );
}

function ReportDetailView({ item, detail }: { item: InboxItemInput; detail: ReportDetail }) {
  return (
    <InboxDetailShell
      title={item.title}
      subtitle="Report"
      timestamp={item.timestamp}
      actions={<ReportActions id={detail.row.id} />}
    >
      <div className="min-w-0 space-y-3">
        <p className="text-sm break-words text-foreground">
          <span className="font-medium">Reason: </span>
          {detail.row.reason || "No reason given"}
        </p>
        {detail.row.community_posts?.content && (
          <div className="min-w-0 rounded-md border border-border p-3">
            <p className="mb-1 text-xs text-muted-foreground">Reported post content:</p>
            <p className="text-sm whitespace-pre-wrap break-words text-foreground">
              {detail.row.community_posts.content}
            </p>
          </div>
        )}
      </div>
    </InboxDetailShell>
  );
}
