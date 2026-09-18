"use client";

import { useState, useTransition } from "react";
import { UserPlus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createUser } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

function generateSecurePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let pwd = "";
  for (let i = 0; i < 10; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<"resident" | "business">("resident");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleGeneratePassword() {
    setPassword(generateSecurePassword());
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createUser(formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success("User created successfully.");
      setOpen(false);
      form.reset();
      setPassword("");
      setRole("resident");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <UserPlus className="size-4" /> Add user
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add new user</DialogTitle>
          <DialogDescription>
            Manually create an active user account. The user will be able to log in on the mobile app immediately with these credentials.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="role">Account role</Label>
            <Select
              name="role"
              value={role}
              onValueChange={(val) => setRole(val as "resident" | "business")}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resident">Resident</SelectItem>
                <SelectItem value="business">Local Business Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" placeholder="e.g. John Doe" required />
          </div>

          {role === "business" && (
            <div className="space-y-1.5">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                name="businessName"
                placeholder="e.g. Linden Bakery"
                required={role === "business"}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" placeholder="user@example.com" required />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Initial password</Label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Sparkles className="size-3" /> Generate
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type="text"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input id="phoneNumber" name="phoneNumber" placeholder="+27 ..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ward">Ward</Label>
              <Input id="ward" name="ward" defaultValue="Ward 87" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="streetAddress">Street address</Label>
            <Input id="streetAddress" name="streetAddress" placeholder="e.g. 12 4th Avenue" />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
