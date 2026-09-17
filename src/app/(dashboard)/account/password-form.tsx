"use client";

import { useMemo, useState } from "react";
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

const REQUIREMENTS = [
  { regex: /.{6,}/, text: "At least 6 characters" },
  { regex: /[a-z]/, text: "At least 1 lowercase letter" },
  { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
  { regex: /[0-9]/, text: "At least 1 number" },
];

const STRENGTH_COLORS = ["bg-border", "bg-destructive", "bg-orange-500", "bg-amber-500", "bg-green-500"];
const STRENGTH_LABELS = ["Enter a password", "Weak password", "Medium password", "Strong password", "Very strong password"];

export function PasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const requirementResults = REQUIREMENTS.map((req) => ({ met: req.regex.test(password), text: req.text }));
  const score = useMemo(() => requirementResults.filter((r) => r.met).length, [requirementResults]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated.");
    setPassword("");
    setConfirm("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <InputGroup>
          <InputGroupInput
            id="new-password"
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <InputGroupAddon align="inline-end" className="pr-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setVisible((v) => !v)}
              className="text-muted-foreground hover:bg-transparent"
            >
              {visible ? <EyeOffIcon /> : <EyeIcon />}
            </Button>
          </InputGroupAddon>
        </InputGroup>

        <div className="mt-3 mb-2 flex h-1 w-full gap-1">
          {Array.from({ length: REQUIREMENTS.length }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-full flex-1 rounded-full transition-all duration-500 ease-out",
                i < score ? STRENGTH_COLORS[score] : "bg-border"
              )}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-foreground">{STRENGTH_LABELS[score]}. Must contain:</p>
        <ul className="space-y-1.5">
          {requirementResults.map((req, i) => (
            <li key={i} className="flex items-center gap-2">
              {req.met ? (
                <CheckIcon className="size-4 text-green-600 dark:text-green-400" />
              ) : (
                <XIcon className="size-4 text-muted-foreground" />
              )}
              <span className={cn("text-xs", req.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>
                {req.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <InputGroup>
          <InputGroupInput
            id="confirm-password"
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </InputGroup>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="max-sm:w-full">
          {loading ? "Updating…" : "Update password"}
        </Button>
      </div>
    </form>
  );
}
