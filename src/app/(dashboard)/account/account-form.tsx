"use client";

import { useState, useTransition } from "react";
import { MailIcon } from "lucide-react";
import { toast } from "sonner";
import { updateOwnName } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export function AccountForm({ initialName, email }: { initialName: string; email: string | null }) {
  const [name, setName] = useState(initialName);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateOwnName(name);
      if (result.error) toast.error(result.error);
      else toast.success("Saved.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <InputGroup>
          <InputGroupInput id="email" value={email || "—"} readOnly disabled />
          <InputGroupAddon align="inline-end" className="pr-2.75">
            <MailIcon className="size-4" />
          </InputGroupAddon>
        </InputGroup>
        <p className="text-xs text-muted-foreground">Contact another admin to change your sign-in email.</p>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="max-sm:w-full">
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
