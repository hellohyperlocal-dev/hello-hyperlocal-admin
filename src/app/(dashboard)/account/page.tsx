import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { AccountForm } from "./account-form";
import { PasswordForm } from "./password-form";

export default async function AccountPage() {
  const admin = await requireAdmin();

  return (
    <div className="min-w-0 max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Account</h1>
        <p className="text-sm text-muted-foreground">Your own admin account settings.</p>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Profile</h2>
        <AccountForm initialName={admin.full_name || ""} />
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Password</h2>
        <PasswordForm />
      </Card>
    </div>
  );
}
