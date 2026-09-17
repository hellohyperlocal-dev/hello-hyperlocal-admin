import { createAdminClient } from "@/lib/supabase/admin";
import { isPreviewMode } from "@/lib/preview-mode";
import { AddCouncillorDialog } from "./add-councillor-dialog";
import { InviteTable, type InviteRow } from "./invite-table";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SAMPLE_COUNCILLORS = [
  { id: "sample-1", full_name: "Cllr. T. Mahlangu", ward: "Ward 87", created_at: "2026-06-01T00:00:00Z" },
  { id: "sample-2", full_name: "Cllr. N. Dlamini", ward: "Ward 92", created_at: "2026-07-14T00:00:00Z" },
];

const SAMPLE_INVITES: InviteRow[] = [
  {
    id: "sample-invite-1",
    name: "Cllr. R. Botha",
    ward: "Ward 104",
    email: "r.botha@example.com",
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    consumed_at: null,
    revoked_at: null,
    created_at: new Date().toISOString(),
  },
];

export default async function CouncillorsPage() {
  const [{ data: councillors }, { data: invites }] = isPreviewMode
    ? [{ data: SAMPLE_COUNCILLORS }, { data: SAMPLE_INVITES }]
    : await (async () => {
        const admin = createAdminClient();
        return Promise.all([
          admin.from("profiles").select("id, full_name, ward, created_at").eq("role", "councillor").order("created_at", { ascending: false }),
          admin.from("invites").select("id, name, ward, email, expires_at, consumed_at, revoked_at, created_at").eq("role", "councillor").order("created_at", { ascending: false }),
        ]);
      })();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Ward Councillors</h1>
          <p className="text-sm text-muted-foreground">Manage councillor accounts and invite links.</p>
        </div>
        <AddCouncillorDialog />
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Active councillors</h2>
        {councillors && councillors.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Ward</TableHead>
                <TableHead>Since</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {councillors.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.full_name || "—"}</TableCell>
                  <TableCell>{c.ward || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No councillor accounts yet.</p>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Invites</h2>
        <InviteTable invites={(invites as InviteRow[]) ?? []} />
      </Card>
    </div>
  );
}
