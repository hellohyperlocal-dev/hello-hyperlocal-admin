"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { suspendUser, unsuspendUser, deleteUser } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, UserX, UserCheck, Trash2, Eye } from "lucide-react";

interface Props {
  id: string;
  isSuspended: boolean;
  userName?: string;
  redirectTo?: string;
  displayMode?: "dropdown" | "buttons";
}

export function UserActions({
  id,
  isSuspended,
  userName = "this user",
  redirectTo,
  displayMode = "dropdown",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reason, setReason] = useState("");

  function handleSuspend() {
    startTransition(async () => {
      const result = await suspendUser(id, reason);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("User account suspended. Access has been revoked.");
      setSuspendOpen(false);
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

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUser(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`User "${userName}" has been deleted.`);
      setDeleteOpen(false);
      if (redirectTo) {
        router.push(redirectTo);
      }
    });
  }

  return (
    <>
      {displayMode === "buttons" ? (
        <div className="flex flex-col gap-2 pt-2">
          {isSuspended ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnsuspend}
              disabled={pending}
              className="w-full justify-center gap-1.5"
            >
              <UserCheck className="size-4" /> Unsuspend Account
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSuspendOpen(true)}
              disabled={pending}
              className="w-full justify-center gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20"
            >
              <UserX className="size-4" /> Suspend Account
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            disabled={pending}
            className="w-full justify-center gap-1.5"
          >
            <Trash2 className="size-4" /> Delete Account
          </Button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={pending}
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`/users/${id}`} className="cursor-pointer gap-2">
                <Eye className="size-4" /> View Profile
              </Link>
            </DropdownMenuItem>

            {isSuspended ? (
              <DropdownMenuItem
                onClick={handleUnsuspend}
                className="cursor-pointer gap-2 text-emerald-600 focus:text-emerald-700"
              >
                <UserCheck className="size-4" /> Unsuspend
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => setSuspendOpen(true)}
                className="cursor-pointer gap-2 text-amber-600 focus:text-amber-700"
              >
                <UserX className="size-4" /> Suspend
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" /> Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <AlertDialogContent className="w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend {userName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Suspending this user will immediately revoke their ability to post,
              comment, or transact in the mobile app.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason for suspension (e.g. spam, inappropriate behavior, community guidelines violation)…"
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete {userName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this user account, their login access,
              and all authored content from Hello Linden. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {pending ? "Deleting…" : "Yes, Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
