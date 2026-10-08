import { getAllUsers, type UserRow } from "@/lib/users"
import { isPreviewMode } from "@/lib/preview-mode"
import { UsersClient } from "./users-client"
import type { UserStatCounts } from "./components/user-stat-cards"

const SAMPLE_USERS: UserRow[] = [
  {
    id: "sample-1",
    role: "resident",
    full_name: "Naledi Khumalo",
    email: "naledi@example.com",
    phone_number: "+27 82 000 0000",
    street_address: "12 Main Rd, Linden",
    business_name: null,
    ward: "Ward 87",
    is_suspended: false,
    suspended_at: null,
    suspended_reason: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    role: "business",
    full_name: "Mary-Anne Pretorius",
    email: "maryanne@downsizeup.co.za",
    phone_number: "+27 82 829 6437",
    street_address: "34 4th Avenue, Linden",
    business_name: "Downsize Up",
    ward: "Ward 87",
    is_suspended: false,
    suspended_at: null,
    suspended_reason: null,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "sample-3",
    role: "councillor",
    full_name: "Cllr. Kyle Jacobs",
    email: "kyle@ward87.org.za",
    phone_number: "+27 83 555 1234",
    street_address: "Linden Civic Office",
    business_name: null,
    ward: "Ward 87",
    is_suspended: false,
    suspended_at: null,
    suspended_reason: null,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
]

export default async function UsersPage() {
  const users = isPreviewMode ? SAMPLE_USERS : await getAllUsers()

  const initialCounts: UserStatCounts = {
    total: users.length,
    residents: users.filter((u) => u.role === "resident").length,
    businesses: users.filter((u) => u.role === "business" || Boolean(u.business_name)).length,
    councillors: users.filter((u) => u.role === "councillor" || u.role === "admin" || u.role === "staff").length,
    suspended: users.filter((u) => u.is_suspended).length,
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage resident profiles, registered business accounts, ward councillors, and staff in Ward 87.
        </p>
      </div>

      <UsersClient initialUsers={users} initialCounts={initialCounts} />
    </div>
  )
}
