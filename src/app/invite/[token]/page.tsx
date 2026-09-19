import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { InviteForm } from "./invite-form";
import { SmartphoneIcon, ShieldAlertIcon, CheckCircle2Icon } from "lucide-react";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("invites")
    .select("id, token, email, name, ward, role, expires_at, consumed_at, revoked_at")
    .eq("token", token)
    .single();

  if (!invite) {
    return (
      <AuthShell title="Invalid invite link">
        <Alert variant="destructive" className="mb-6">
          <ShieldAlertIcon className="size-4" />
          <AlertTitle>Invite not found</AlertTitle>
          <AlertDescription>
            This invite link is invalid or may have been removed. Please check the URL or contact your administrator.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Return to Sign In</Link>
        </Button>
      </AuthShell>
    );
  }

  if (invite.revoked_at) {
    return (
      <AuthShell title="Invite revoked">
        <Alert variant="destructive" className="mb-6">
          <ShieldAlertIcon className="size-4" />
          <AlertTitle>Access revoked</AlertTitle>
          <AlertDescription>
            This invitation was revoked by an administrator and can no longer be used.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Return to Sign In</Link>
        </Button>
      </AuthShell>
    );
  }

  if (invite.consumed_at) {
    return (
      <AuthShell title="Invite already accepted">
        <Alert className="mb-6 border-primary/30 bg-primary/5 text-primary">
          <CheckCircle2Icon className="size-4 text-primary" />
          <AlertTitle>Account active</AlertTitle>
          <AlertDescription className="text-foreground/80">
            This invite has already been accepted. You can log in using your email and password.
          </AlertDescription>
        </Alert>
        <Button asChild className="w-full">
          <Link href="/login">Sign In to Dashboard</Link>
        </Button>
      </AuthShell>
    );
  }

  const isExpired = new Date(invite.expires_at) < new Date();
  if (isExpired) {
    return (
      <AuthShell title="Invite expired">
        <Alert variant="destructive" className="mb-6">
          <ShieldAlertIcon className="size-4" />
          <AlertTitle>Link expired</AlertTitle>
          <AlertDescription>
            This invitation expired on {new Date(invite.expires_at).toLocaleDateString()}. Please request a new invite.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Return to Sign In</Link>
        </Button>
      </AuthShell>
    );
  }

  // Councillor invite opened on the web portal
  if (invite.role === "councillor") {
    const mobileLink = `hello-hyperlocal://invite/${token}`;
    return (
      <AuthShell title="Councillor Invite">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <SmartphoneIcon className="size-6" />
          </div>
          <p className="text-sm text-foreground">
            Hi <strong>{invite.name}</strong>, you have been invited as the Ward Councillor for{" "}
            <strong>{invite.ward}</strong>.
          </p>
          <p className="text-xs text-muted-foreground">
            Ward Councillor accounts are accessed through the <strong>Hello Hyperlocal</strong> mobile app. Please
            open this link on your smartphone or tap the button below if you have the app installed.
          </p>
          <Button asChild className="w-full gap-2">
            <a href={mobileLink}>Open in Mobile App</a>
          </Button>
          <Button asChild variant="ghost" className="w-full text-xs">
            <Link href="/login">Admin Sign In</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  // Valid Admin Invite
  return (
    <AuthShell title="Accept Admin Invite">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Welcome to Hello Hyperlocal, <span className="font-semibold text-foreground">{invite.name}</span>. Set your
          password below to complete setup and activate your administrator account.
        </p>
      </div>
      <InviteForm token={token} name={invite.name} email={invite.email} />
    </AuthShell>
  );
}
