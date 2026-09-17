"use client";

import { useState, useTransition } from "react";
import { Copy, Check, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { resendInvite, revokeInvite } from "../councillors/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { InviteRow } from "../councillors/invite-table";

type Status = "pending" | "expired" | "consumed" | "revoked";

function statusFor(invite: InviteRow): Status {
  if (invite.revoked_at) return "revoked";
  if (invite.consumed_at) return "consumed";
  if (new Date(invite.expires_at) < new Date()) return "expired";
  return "pending";
}

const STATUS_STYLES: Record<Status, string> = {
  pending: "bg-accent text-accent-foreground",
  expired: "bg-secondary text-muted-foreground",
  consumed: "bg-primary-pale text-positive-deep",
  revoked: "bg-destructive/10 text-destructive",
};

export function AdminInviteTable({ invites }: { invites: InviteRow[] }) {
  if (invites.length === 0) {
    return <p className="p-6 text-sm text-muted-foreground">No invites yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {invites.map((invite) => (
          <InviteRowItem key={invite.id} invite={invite} />
        ))}
      </TableBody>
    </Table>
  );
}

function InviteRowItem({ invite }: { invite: InviteRow }) {
  const [pending, startTransition] = useTransition();
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const status = statusFor(invite);

  function handleResend() {
    startTransition(async () => {
      const result = await resendInvite(invite.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setLastLink(result.inviteLink ?? null);
      toast.success("Invite resent — new link generated.");
    });
  }

  function handleRevoke() {
    startTransition(async () => {
      const result = await revokeInvite(invite.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Invite revoked.");
    });
  }

  async function copyLink() {
    if (!lastLink) return;
    await navigator.clipboard.writeText(lastLink);
    setCopied(true);
    toast.success("Link copied.");
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{invite.name}</TableCell>
      <TableCell className="text-muted-foreground">{invite.email}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge className={STATUS_STYLES[status]}>{status}</Badge>
          {lastLink && (
            <Button type="button" size="icon-xs" variant="ghost" onClick={copyLink} title="Copy new link">
              {copied ? <Check className="text-positive" /> : <Copy />}
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell>
        {status !== "revoked" && status !== "consumed" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="ghost" disabled={pending}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleResend}>Resend</DropdownMenuItem>
              <DropdownMenuItem onClick={handleRevoke} variant="destructive">
                Revoke
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
}
