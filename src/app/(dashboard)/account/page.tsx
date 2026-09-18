import { requireAdmin } from "@/lib/auth";
import { getUserEmail } from "@/lib/users";
import { Separator } from "@/components/ui/separator";
import { AccountForm } from "./account-form";
import { PasswordForm } from "./password-form";

export default async function AccountPage() {
  const admin = await requireAdmin();
  const email = await getUserEmail(admin.id);

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Account</h1>
        <p className="text-sm text-muted-foreground">Your own admin account settings.</p>
      </div>

      <SettingsSection title="Personal Information" description="Manage your photo and name as shown across the dashboard.">
        <AccountForm initialName={admin.full_name || ""} initialAvatarUrl={admin.avatar_url} email={email} />
      </SettingsSection>

      <Separator />

      <SettingsSection title="Password" description="Change the password used to sign in to this dashboard.">
        <PasswordForm />
      </SettingsSection>
    </div>
  );
}

function SettingsSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-3 lg:gap-10">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="lg:col-span-2">{children}</div>
    </div>
  );
}
