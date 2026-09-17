import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, CalendarCheck } from "lucide-react";
import { getUserDetail } from "@/lib/users";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserActions } from "../user-actions";

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserDetail(id);
  if (!user) notFound();

  const displayName = user.full_name || user.business_name || "Unnamed user";

  const detailRows: { label: string; value: string }[] = [
    { label: "Email", value: user.email || "—" },
    { label: "Phone", value: user.phone_number || "—" },
    { label: "Role", value: user.role },
    { label: "Ward", value: user.ward || "—" },
    { label: "Address", value: user.street_address || "—" },
    { label: "Business", value: user.business_name || "—" },
    { label: "Member since", value: new Date(user.created_at).toLocaleDateString() },
  ];

  return (
    <div className="min-w-0 space-y-4">
      <Link href="/users" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to users
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="size-24">
                <AvatarFallback className="text-2xl">{initials(displayName)}</AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-semibold text-foreground">{displayName}</h2>
              <Badge variant="secondary" className="mt-2 capitalize">
                {user.role}
              </Badge>
              {user.is_suspended && (
                <Badge variant="destructive" className="mt-2">
                  Suspended
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <StatBox icon={FileText} value={user.communityPostsCount} label="Posts" />
              <StatBox icon={FileText} value={user.marketplaceListingsCount + user.loveLocalOffersCount} label="Listings" />
              <StatBox icon={CalendarCheck} value={user.rsvpCount} label="RSVPs" />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Details</h3>
              <Separator />
              {detailRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="truncate text-right font-medium text-foreground">{row.value}</span>
                </div>
              ))}
              {user.is_suspended && user.suspended_reason && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <span className="font-medium">Suspension reason: </span>
                  {user.suspended_reason}
                </div>
              )}
            </div>

            <UserActions id={user.id} isSuspended={user.is_suspended} />
          </CardContent>
        </Card>

        <Card className="py-0">
          <h3 className="p-6 pb-0 text-sm font-semibold text-foreground">Recent community posts</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.recentPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    No posts yet.
                  </TableCell>
                </TableRow>
              ) : (
                user.recentPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell className="capitalize">{post.moderation_status}</TableCell>
                    <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, value, label }: { icon: typeof FileText; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-border bg-muted/40 p-4 text-center">
      <Icon className="mb-2 size-5 text-primary" />
      <span className="text-lg font-semibold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
