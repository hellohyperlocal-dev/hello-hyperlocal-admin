import { getRegistrations, REGISTRATION_ROLES, type RegistrationDetail } from "@/lib/registrations";
import { isPreviewMode } from "@/lib/preview-mode";
import { InboxShell } from "@/components/inbox/inbox-shell";
import { InboxDetailShell } from "@/components/inbox/inbox-detail-shell";
import { Badge } from "@/components/ui/badge";
import type { InboxItem, InboxItemInput } from "@/components/inbox/types";

const SAMPLE_ITEMS: InboxItemInput[] = [
  {
    id: "sample-1",
    categoryId: "founding_neighbour",
    title: "Naledi Khumalo",
    subtitle: "Founding Neighbour",
    preview: "Linden resident, excited to join",
    timestamp: new Date().toISOString(),
    isNew: true,
  },
  {
    id: "sample-2",
    categoryId: "founding_business",
    title: "Corner Cafe",
    subtitle: "Founding Business",
    preview: "12 4th Avenue, Linden",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    isNew: false,
    badge: { label: "Claimed", variant: "secondary" },
  },
];

const SAMPLE_DETAIL: Record<string, Partial<RegistrationDetail>> = {
  "sample-1": {
    email: "naledi@example.com",
    mobile: "+27 82 000 0000",
    suburb: "Linden",
    interests: ["events", "marketplace"],
    roles: ["resident", "founding_neighbour"],
  },
  "sample-2": {
    email: "corner@example.com",
    business_name: "Corner Cafe",
    business_address: "12 4th Avenue, Linden",
    wants_window_sticker: true,
    roles: ["business", "founding_business"],
  },
};

export default async function RegistrationsPage() {
  if (isPreviewMode) {
    const items: InboxItem[] = SAMPLE_ITEMS.map((item) => ({
      ...item,
      detail: (
        <RegistrationDetailView item={item} detail={SAMPLE_DETAIL[item.id] as RegistrationDetail} />
      ),
    }));
    return (
      <div className="space-y-4">
        <PageHeader />
        <InboxShell
          categories={REGISTRATION_ROLES.map((r) => ({
            ...r,
            count: items.filter((i) => i.categoryId === r.id).length,
          }))}
          items={items}
        />
      </div>
    );
  }

  const { categories, items: rawItems, byId } = await getRegistrations();
  const items: InboxItem[] = rawItems.map((item) => {
    const detail = byId.get(item.id);
    return { ...item, detail: detail ? <RegistrationDetailView item={item} detail={detail} /> : null };
  });

  return (
    <div className="space-y-4">
      <PageHeader />
      <InboxShell categories={categories} items={items} />
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Registrations</h1>
      <p className="text-sm text-muted-foreground">Website sign-ups from hellohyperlocal.co.za.</p>
    </div>
  );
}

function RegistrationDetailView({ item, detail }: { item: InboxItemInput; detail: RegistrationDetail }) {
  return (
    <InboxDetailShell title={item.title} subtitle={item.subtitle} timestamp={item.timestamp}>
      <dl className="space-y-3 text-sm">
        <Row label="Email" value={detail.email} />
        {detail.mobile && <Row label="Mobile" value={detail.mobile} />}
        {detail.roles?.length > 0 && (
          <Row
            label="Roles"
            value={
              <div className="flex flex-wrap gap-1">
                {detail.roles.map((r) => (
                  <Badge key={r} variant="outline">
                    {r}
                  </Badge>
                ))}
              </div>
            }
          />
        )}
        {detail.suburb && <Row label="Suburb" value={detail.suburb} />}
        {detail.interests?.length > 0 && <Row label="Interests" value={detail.interests.join(", ")} />}
        {detail.business_name && <Row label="Business" value={detail.business_name} />}
        {detail.business_address && <Row label="Business address" value={detail.business_address} />}
        {detail.wants_window_sticker !== undefined && (
          <Row label="Wants window sticker" value={detail.wants_window_sticker ? "Yes" : "No"} />
        )}
        {detail.details && Object.keys(detail.details).length > 0 && (
          <Row
            label="Additional details"
            value={
              <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs text-muted-foreground">
                {JSON.stringify(detail.details, null, 2)}
              </pre>
            }
          />
        )}
        <Row label="Marketing consent" value={detail.consent_at ? "Yes" : "No"} />
        <Row label="Claimed" value={detail.claimed_at ? new Date(detail.claimed_at).toLocaleDateString() : "Not yet"} />
      </dl>
    </InboxDetailShell>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-foreground">{value}</dd>
    </div>
  );
}
