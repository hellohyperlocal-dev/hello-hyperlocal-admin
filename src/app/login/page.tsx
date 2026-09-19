"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthShell } from "@/components/auth-shell";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAccepted = searchParams.get("accepted") === "true";

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
    router.push("/");
    router.refresh();
  }

  return (
    <AuthShell title="Admin sign in">
      {isAccepted && (
        <Alert className="mb-4 border-primary/30 bg-primary/5 text-primary">
          <AlertDescription>Your administrator account has been activated! Please sign in.</AlertDescription>
        </Alert>
      )}

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
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Admin sign in">
          <div className="flex justify-center py-6 text-sm text-muted-foreground">Loading…</div>
        </AuthShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
