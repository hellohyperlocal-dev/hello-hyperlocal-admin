import { requireAdmin } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      {isPreviewMode && (
        <div className="bg-warning px-4 py-2 text-center text-xs font-semibold text-warning-content">
          Preview mode — sample data only, no sign-in required, no changes are saved.
        </div>
      )}
      <SidebarProvider className="flex-1">
        <AppSidebar adminName={admin.full_name || "Admin"} />
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
