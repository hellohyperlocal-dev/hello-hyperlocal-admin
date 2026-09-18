import { createAdminClient } from "@/lib/supabase/admin";
import { isPreviewMode } from "@/lib/preview-mode";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { AddWardUpdateDialog } from "./add-ward-update-dialog";

interface WardUpdateRow {
  id: string;
  category: string;
  title: string;
  ward: string;
  is_pinned: boolean;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

const SAMPLE: WardUpdateRow[] = [
  {
    id: "sample-1",
    category: "Safety",
    title: "Water outage scheduled for Tuesday",
    ward: "Ward 87",
    is_pinned: true,
    created_at: new Date().toISOString(),
    profiles: { full_name: "Cllr. T. Mahlangu" },
  },
];

const SAMPLE_COUNCILLORS = [
  { id: "sample-1", full_name: "Cllr. T. Mahlangu", ward: "Ward 87" },
];

export default async function WardUpdatesPage() {
  const [updates, councillors] = isPreviewMode
    ? [SAMPLE, SAMPLE_COUNCILLORS]
    : await Promise.all([getWardUpdates(), getCouncillors()]);

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Ward updates</h1>
          <p className="text-sm text-muted-foreground">Oversight and direct publishing of councillor broadcasts.</p>
        </div>
        <AddWardUpdateDialog councillors={councillors} />
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Councillor</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead>Pinned</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No ward updates yet.
                </TableCell>
              </TableRow>
            ) : (
              updates.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.title}</TableCell>
                  <TableCell>{u.category}</TableCell>
                  <TableCell>{u.ward}</TableCell>
                  <TableCell>{u.profiles?.full_name || "—"}</TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{u.is_pinned && <Badge variant="secondary">Pinned</Badge>}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

async function getWardUpdates(): Promise<WardUpdateRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ward_updates")
    .select("id, category, title, ward, is_pinned, created_at, profiles!councillor_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data as unknown as WardUpdateRow[]) ?? [];
}

async function getCouncillors(): Promise<{ id: string; full_name: string | null; ward: string | null }[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, full_name, ward")
    .eq("role", "councillor")
    .order("full_name", { ascending: true });
  return data ?? [];
}
