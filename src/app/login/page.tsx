"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

// No self-service sign-up: admin accounts are loaded manually (directly in
// Supabase), never created from this form. Sign-in checks credentials AND
// that the account is a real role='admin' profile — anything else is denied
// right here, before ever reaching the dashboard's own requireAdmin() gate.
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setLoading(false);
      setError(signInError?.message || "Sign in failed.");
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();

    if (!profile || profile.role !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      setError("No admin access for this account.");
      return;
    }

    // requireAdmin() (on every (dashboard) page) redirects to /verify-otp
    // automatically for a first-time admin login, sending the confirmation
    // code — nothing more to do here for that.
    router.push("/councillors");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-sm rounded-xl bg-card p-8">
        <div className="mb-6 space-y-1 text-center">
          <p className="text-xs font-semibold tracking-wide text-accent-foreground uppercase">Hello Linden</p>
          <h1 className="text-2xl font-semibold text-foreground">Admin sign in</h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Link
              href="/forgot-password"
              className="block text-right text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
