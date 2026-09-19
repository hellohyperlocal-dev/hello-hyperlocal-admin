"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { acceptAdminInvite } from "./actions";
import { toast } from "sonner";

interface InviteFormProps {
  token: string;
  name: string;
  email: string;
}

export function InviteForm({ token, name, email }: InviteFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const res = await acceptAdminInvite({ token, password });
      if (res.error) {
        setError(res.error);
        return;
      }

      toast.success("Account activated! You can now sign in.");
      router.push("/login?accepted=true");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" type="text" value={name} disabled className="bg-muted text-muted-foreground" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" value={email} disabled className="bg-muted text-muted-foreground" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Create Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          disabled={pending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter password"
          disabled={pending}
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Activating Account…" : "Activate Administrator Account"}
      </Button>
    </form>
  );
}
