"use client";

import { useState, useTransition } from "react";
import { MailIcon } from "lucide-react";
import { toast } from "sonner";
import { AvatarUploader } from "@/components/media/avatar-uploader";
import { updateOwnProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export function AccountForm({
  initialName,
  initialAvatarUrl,
  email,
}: {
  initialName: string;
  initialAvatarUrl?: string | null;
  email: string | null;
}) {
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateOwnProfile({ fullName: name, avatarUrl });
      if (result.error) toast.error(result.error);
      else toast.success("Saved successfully.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Uploader from template styled components */}
      <AvatarUploader
        initialUrl={avatarUrl}
        nameFallback={name || "Admin"}
        folder="admin-avatars"
        onUploaded={(url) => setAvatarUrl(url)}
      />

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
