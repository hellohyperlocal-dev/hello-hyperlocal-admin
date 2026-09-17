import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl bg-card p-8 text-center">
        <p className="text-xs font-semibold tracking-wide text-negative-deep uppercase">Access denied</p>
        <h1 className="text-xl font-semibold text-foreground">This dashboard is admin-only</h1>
        <p className="text-sm text-muted-foreground">
          Your account doesn&apos;t have admin access yet. You&apos;ve been signed out. If you believe this is a
          mistake, ask an existing admin to check your account&apos;s role.
        </p>
        <Button asChild className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    </div>
  );
}
