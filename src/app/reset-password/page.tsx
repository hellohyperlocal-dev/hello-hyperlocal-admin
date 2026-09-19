"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthShell } from "@/components/auth-shell";

type Status = "checking" | "ready" | "expired";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function checkRecovery() {
      // 1. Check if a session already exists (e.g. redirected from /auth/callback)
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && isMounted) {
        setStatus("ready");
        return;
      }

      // 2. Check if a PKCE code is in query params
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!exchangeError && isMounted) {
          setStatus("ready");
          return;
        }
      }
    }

    checkRecovery();

    // 3. Supabase recovery event from URL hash or internal state change
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (isMounted) setStatus("ready");
      }
    });

    const timeout = setTimeout(() => {
      if (isMounted) {
        setStatus((current) => (current === "checking" ? "expired" : current));
      }
    }, 4000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/login");
  }

  return (
    <AuthShell title="Set a new password">
        {status === "checking" && <p className="text-center text-sm text-muted-foreground">Checking your link…</p>}

        {status === "expired" && (
          <>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                This reset link is invalid or has expired. Request a new one below.
              </AlertDescription>
            </Alert>
            <Link href="/forgot-password">
              <Button className="w-full">Request a new link</Button>
            </Link>
          </>
        )}

        {status === "ready" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait…" : "Set new password"}
            </Button>
          </form>
        )}
    </AuthShell>
  );
}
