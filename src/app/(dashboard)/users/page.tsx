import Link from "next/link";
import { getUsers } from "@/lib/users";
import { isPreviewMode } from "@/lib/preview-mode";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserFilters } from "./filters";
import { UserActions } from "./user-actions";

const SAMPLE_USERS = [
  {
    id: "sample-1",
    role: "resident",
    full_name: "Naledi Khumalo",
    phone_number: "+27 82 000 0000",
    street_address: "12 Main Rd",
    business_name: null,
    ward: "Ward 87",
    is_suspended: false,
    suspended_at: null,
    suspended_reason: null,
    created_at: new Date().toISOString(),
  },
];

interface Props {
  searchParams: Promise<{ role?: string; q?: string; page?: string }>;
}

export default async function UsersPage({ searchParams }: Props) {
  const { role = "all", q = "", page = "1" } = await searchParams;

  if (isPreviewMode) {
    return (
      <div className="min-w-0 space-y-4">
        <PageHeader />
        <UsersTable users={SAMPLE_USERS} role={role} search={q} page={1} totalPages={1} />
      </div>
    );
  }

  const { users, page: currentPage, totalPages } = await getUsers({ role, search: q, page: Number(page) });

  return (
    <div className="min-w-0 space-y-4">
      <PageHeader />
      <UsersTable users={users} role={role} search={q} page={currentPage} totalPages={totalPages} />
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Users</h1>
      <p className="text-sm text-muted-foreground">Residents, businesses, and councillors.</p>
    </div>
  );
}

function UsersTable({
  users,
  role,
  search,
  page,
  totalPages,
}: {
  users: {
    id: string;
    role: string;
    full_name: string | null;
    phone_number: string | null;
    street_address: string | null;
    business_name: string | null;
    ward: string | null;
    is_suspended: boolean;
    suspended_at: string | null;
    suspended_reason: string | null;
    created_at: string;
  }[];
  role: string;
  search: string;
  page: number;
  totalPages: number;
}) {
  return (
    <Card className="py-0">
      <UserFilters role={role} search={search} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Ward</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No users match.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <Link href={`/users/${user.id}`} className="hover:underline">
                    {user.full_name || user.business_name || "—"}
                  </Link>
                </TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell>{user.ward || "—"}</TableCell>
                <TableCell>{user.phone_number || "—"}</TableCell>
                <TableCell>
                  {user.is_suspended ? <Badge variant="destructive">Suspended</Badge> : <Badge variant="secondary">Active</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <UserActions id={user.id} isSuspended={user.is_suspended} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border p-4 text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/users?role=${role}&q=${search}&page=${page - 1}`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/users?role=${role}&q=${search}&page=${page + 1}`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
