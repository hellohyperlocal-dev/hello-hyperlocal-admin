"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthShell } from "@/components/auth-shell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    // Always show the same success state regardless of whether the address has
    // an account — never let this form confirm/deny account existence.
    if (resetError) {
      console.error("[forgot-password]", resetError);
    }
    setSent(true);
  }

  return (
    <AuthShell title="Reset your password">
        {sent ? (
          <Alert className="mb-4">
            <AlertDescription>
              If {email} has an admin account, we&apos;ve sent a password reset link to it. Check your email.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hellolinden.co.za"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait…" : "Send reset link"}
            </Button>
          </form>
        )}

        <Link
          href="/login"
          className="mt-4 block w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
    </AuthShell>
  );
}
