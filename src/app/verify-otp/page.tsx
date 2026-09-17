"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { requestLoginOtp, verifyLoginOtp } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthShell } from "@/components/auth-shell";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const requestedOnce = useRef(false);

  useEffect(() => {
    // Send the first code automatically on arrival. StrictMode/fast-refresh in
    // dev can mount this twice — the ref guards against firing it twice on the
    // same navigation (it's fine either way, just avoids a redundant email).
    if (requestedOnce.current) return;
    requestedOnce.current = true;
    requestLoginOtp().then((result) => {
      if (result.error) setError(result.error);
      else setInfo("We've emailed you a 6-digit verification code.");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await verifyLoginOtp(code);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    setResending(true);
    const result = await requestLoginOtp();
    setResending(false);
    if (result.error) setError(result.error);
    else setInfo("A new code is on its way.");
  }

  return (
    <AuthShell title="Confirm it's you">
        <p className="mb-6 -mt-4 text-center text-sm text-muted-foreground">
          First time signing in — enter the code we emailed you to finish setting up this account.
        </p>

        {info && (
          <Alert className="mb-4">
            <AlertDescription>{info}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="text-center text-lg tracking-[0.3em]"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
            {loading ? "Verifying…" : "Verify"}
          </Button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="mt-4 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          {resending ? "Sending…" : "Didn't get a code? Resend"}
        </button>
    </AuthShell>
  );
}
