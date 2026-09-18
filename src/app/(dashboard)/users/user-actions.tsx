"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { suspendUser, unsuspendUser } from "./actions";
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
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

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
      toast.success("User account suspended. Access has been revoked.");
      setOpen(false);
      setReason("");
    });
  }

  function handleUnsuspend() {
    startTransition(async () => {
      const result = await unsuspendUser(id);
      if (result.error) toast.error(result.error);
      else toast.success("User unsuspended. Access restored.");
    });
  }

  if (isSuspended) {
    return (
      <Button size="sm" variant="outline" onClick={handleUnsuspend} disabled={pending}>
        {pending ? "Please wait…" : "Unsuspend account"}
      </Button>
    );
  }

  return (
    <>
      <Button size="sm" variant="destructive" onClick={() => setOpen(true)} disabled={pending}>
        Suspend
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend this user?</AlertDialogTitle>
            <AlertDialogDescription>
              Suspending this user will immediately revoke their ability to post, comment, or transact in the mobile app.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason for suspension (required for audit log)…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="my-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={pending || !reason.trim()}
            >
              {pending ? "Suspending…" : "Confirm suspension"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
