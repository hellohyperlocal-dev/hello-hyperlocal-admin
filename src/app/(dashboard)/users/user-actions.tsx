"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { suspendUser, unsuspendUser } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function UserActions({ id, isSuspended }: { id: string; isSuspended: boolean }) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  function handleSuspend() {
    startTransition(async () => {
      const result = await suspendUser(id, reason);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("User suspended.");
      setOpen(false);
      setReason("");
    });
  }

  function handleUnsuspend() {
    startTransition(async () => {
      const result = await unsuspendUser(id);
      if (result.error) toast.error(result.error);
      else toast.success("User unsuspended.");
    });
  }

  if (isSuspended) {
    return (
      <Button size="sm" variant="outline" onClick={handleUnsuspend} disabled={pending}>
        {pending ? "Please wait…" : "Unsuspend"}
      </Button>
    );
  }

  return (
    <>
      <Button size="sm" variant="destructive" onClick={() => setOpen(true)} disabled={pending}>
        Suspend
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend user</DialogTitle>
          </DialogHeader>
          <Textarea placeholder="Reason for suspension…" value={reason} onChange={(e) => setReason(e.target.value)} />
          <DialogFooter>
            <Button variant="destructive" onClick={handleSuspend} disabled={pending || !reason.trim()}>
              {pending ? "Suspending…" : "Confirm suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
