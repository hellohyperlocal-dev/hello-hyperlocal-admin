import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { AddAdminDialog } from "./add-admin-dialog";
import { AdminInviteTable } from "./admin-invite-table";
import { RemoveAccessButton } from "./remove-access-button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { InviteRow } from "../councillors/invite-table";

const SAMPLE_ADMINS = [{ id: "sample-1", full_name: "Preview Admin", created_at: "2026-06-01T00:00:00Z" }];
const SAMPLE_INVITES: InviteRow[] = [];

export default async function AdminTeamPage() {
  const currentAdmin = await requireAdmin();

  const [{ data: admins }, { data: invites }] = isPreviewMode
    ? [{ data: SAMPLE_ADMINS }, { data: SAMPLE_INVITES }]
    : await (async () => {
        const admin = createAdminClient();
        return Promise.all([
          admin.from("profiles").select("id, full_name, created_at").eq("role", "admin").order("created_at", { ascending: false }),
          admin
            .from("invites")
            .select("id, name, ward, email, expires_at, consumed_at, revoked_at, created_at")
            .eq("role", "admin")
            .order("created_at", { ascending: false }),
        ]);
      })();

  return (
    <div className="min-w-0 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Admin team</h1>
          <p className="text-sm text-muted-foreground">Manage who has admin access to this dashboard.</p>
        </div>
        <AddAdminDialog />
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Active admins</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Since</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(admins ?? []).map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">
                  {a.full_name || "—"}
                  {a.id === currentAdmin.id && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                </TableCell>
                <TableCell>{new Date(a.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <RemoveAccessButton id={a.id} isSelf={a.id === currentAdmin.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="py-0">
        <h2 className="p-6 pb-0 text-sm font-semibold text-foreground">Invites</h2>
        <AdminInviteTable invites={invites ?? []} />
      </Card>
    </div>
  );
}
