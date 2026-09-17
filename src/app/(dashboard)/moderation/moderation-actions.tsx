"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { approveContent, rejectContent, resolveReport } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { ModerationTable } from "@/lib/moderation";

export function ContentActions({ table, id }: { table: ModerationTable; id: string }) {
  const [pending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  function handleApprove() {
    startTransition(async () => {
      const result = await approveContent(table, id);
      if (result.error) toast.error(result.error);
      else toast.success("Approved.");
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectContent(table, id, reason);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Rejected.");
      setRejectOpen(false);
      setReason("");
    });
  }

  return (
    <>
      <Button onClick={handleApprove} disabled={pending}>
        Approve
      </Button>
      <Button variant="destructive" onClick={() => setRejectOpen(true)} disabled={pending}>
        Reject
      </Button>
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject content</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={handleReject} disabled={pending || !reason.trim()} variant="destructive">
              {pending ? "Rejecting…" : "Confirm reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
