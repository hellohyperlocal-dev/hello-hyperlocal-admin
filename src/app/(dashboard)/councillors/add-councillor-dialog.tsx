"use client";

import { useState, useTransition } from "react";
import { Plus, Copy, Check, Sparkles, UserCheck, Mail } from "lucide-react";
import { toast } from "sonner";
import { createInvite, createCouncillorAccount } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

function generateSecurePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let pwd = "";
  for (let i = 0; i < 10; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export function AddCouncillorDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState("");

  function handleDirectSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createCouncillorAccount(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Councillor account created successfully.");
      setOpen(false);
      form.reset();
      setPassword("");
    });
  }

  function handleInviteSubmit(formData: FormData) {
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
      setPassword("");
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
        <Button size="sm" className="gap-2">
          <Plus className="size-4" /> Add ward councillor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{inviteLink ? "Invite created" : "Add ward councillor"}</DialogTitle>
          {!inviteLink && (
            <DialogDescription>
              Create an active councillor account directly or generate a shareable invite link.
            </DialogDescription>
          )}
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
          <Tabs defaultValue="direct" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="direct" className="gap-1.5">
                <UserCheck className="size-3.5" /> Direct Account
              </TabsTrigger>
              <TabsTrigger value="invite" className="gap-1.5">
                <Mail className="size-3.5" /> Invite Link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="direct" className="pt-3">
              <form onSubmit={handleDirectSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="direct-name">Full name</Label>
                  <Input id="direct-name" name="name" required placeholder="Cllr. T. Mahlangu" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="direct-ward">Ward</Label>
                    <Input id="direct-ward" name="ward" required defaultValue="Ward 87" placeholder="Ward 87" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="direct-phone">Phone number</Label>
                    <Input id="direct-phone" name="phoneNumber" placeholder="+27 ..." />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="direct-email">Email address</Label>
                  <Input id="direct-email" name="email" type="email" required placeholder="councillor@example.com" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="direct-password">Initial password</Label>
                    <button
                      type="button"
                      onClick={() => setPassword(generateSecurePassword())}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Sparkles className="size-3" /> Generate
                    </button>
                  </div>
                  <Input
                    id="direct-password"
                    name="password"
                    type="text"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Creating…" : "Create councillor"}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>

            <TabsContent value="invite" className="pt-3">
              <form action={handleInviteSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" required placeholder="Cllr. T. Mahlangu" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ward">Ward</Label>
                  <Input id="ward" name="ward" required defaultValue="Ward 87" placeholder="Ward 87" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="councillor@example.com" />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Creating…" : "Generate invite link"}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
