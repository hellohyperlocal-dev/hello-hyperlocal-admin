"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { approveContent, rejectContent, resolveReport } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import type { ModerationTable } from "@/lib/moderation";

export function ContentActions({ table, id }: { table: ModerationTable; id: string }) {
  const [pending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  function handleApprove() {
    startTransition(async () => {
      const result = await approveContent(table, id);
      if (result.error) toast.error(result.error);
      else toast.success("Content approved and visible on mobile feeds.");
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectContent(table, id, reason);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Content rejected and hidden from feeds.");
      setRejectOpen(false);
      setReason("");
    });
  }

  return (
    <>
      <Button onClick={handleApprove} disabled={pending} className="bg-primary text-primary-foreground hover:bg-primary/90">
        Approve
      </Button>
      <Button variant="destructive" onClick={() => setRejectOpen(true)} disabled={pending}>
        Reject
      </Button>
      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this content?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the item from mobile community feeds. Please provide a reason to assist with moderation records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason for rejection (e.g. offensive language, spam, prohibited item)…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="my-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={pending || !reason.trim()}
            >
              {pending ? "Rejecting…" : "Confirm rejection"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ReportActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function handle(resolution: "resolved" | "dismissed") {
    startTransition(async () => {
      const result = await resolveReport(id, resolution);
      if (result.error) toast.error(result.error);
      else toast.success(resolution === "resolved" ? "Marked resolved." : "Dismissed.");
    });
  }

  return (
    <>
      <Button onClick={() => handle("resolved")} disabled={pending}>
        Resolve
      </Button>
      <Button variant="outline" onClick={() => handle("dismissed")} disabled={pending}>
        Dismiss
      </Button>
    </>
  );
}
