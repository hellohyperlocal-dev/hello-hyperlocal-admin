"use client";

import { useState, useTransition } from "react";
import { Plus, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { createInvite } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AddCouncillorDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createInvite(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setInviteLink(result.inviteLink ?? null);
      toast.success("Invite created.");
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setInviteLink(null);
      setCopied(false);
    }
  }

  async function copyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Link copied.");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Add ward councillor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{inviteLink ? "Invite created" : "Add ward councillor"}</DialogTitle>
        </DialogHeader>

        {inviteLink ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Share this link with the councillor. It expires in 7 days.
            </p>
            <div className="flex items-center gap-2 rounded-md border border-input bg-secondary px-3 py-2">
              <code className="flex-1 truncate text-xs">{inviteLink}</code>
              <Button type="button" size="icon-sm" variant="ghost" onClick={copyLink}>
                {copied ? <Check className="text-positive" /> : <Copy />}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Cllr. T. Mahlangu" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ward">Ward</Label>
              <Input id="ward" name="ward" required placeholder="Ward 87" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="councillor@example.com" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating…" : "Create invite"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
