import { requireAdmin } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { SignOutButton } from "@/components/sign-out-button";
import { NavLinks } from "@/components/nav-links";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      {isPreviewMode && (
        <div className="bg-warning px-4 py-2 text-center text-xs font-semibold text-warning-content">
          Preview mode — sample data only, no sign-in required, no changes are saved.
        </div>
      )}
      <div className="flex flex-1">
        <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-sidebar-border bg-sidebar p-4">
          <div>
            <div className="mb-6 px-2">
              <p className="text-xs font-semibold tracking-wide text-accent-foreground uppercase">Hello Linden</p>
              <p className="text-sm font-medium text-sidebar-foreground">Admin</p>
            </div>
            <NavLinks />
          </div>
          <div className="space-y-2 px-2">
            <p className="truncate text-xs text-muted-foreground">{admin.full_name || "Admin"}</p>
            {!isPreviewMode && <SignOutButton />}
          </div>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
