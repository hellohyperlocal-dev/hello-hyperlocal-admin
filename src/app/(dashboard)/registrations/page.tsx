import { getRegistrations, REGISTRATION_ROLES, type RegistrationDetail } from "@/lib/registrations"
import { RegistrationsClient } from "./registrations-client"
import type { RegistrationUser } from "./components/data-table"

function generateAvatar(name: string) {
  const names = name.split(" ").filter(Boolean)
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase() || "U"
}

function mapToUser(reg: RegistrationDetail): RegistrationUser {
  const name =
    reg.full_name ||
    [reg.first_name, reg.last_name].filter(Boolean).join(" ") ||
    reg.business_name ||
    reg.email

  const roleObj = REGISTRATION_ROLES.find((r) => r.id === reg.primaryRole)
  const roleLabel = roleObj?.label ?? "Registration"

  let category = "Resident"
  if (reg.business_name || reg.primaryRole === "founding_business") {
    category = "Business"
  } else if (reg.primaryRole === "partner_interest") {
    category = "Partner"
  } else if (reg.primaryRole === "general_enquiry") {
    category = "General Enquiry"
  }

  return {
    id: reg.id,
    name,
    email: reg.email,
    avatar: generateAvatar(name),
    role: roleLabel,
    rawRole: reg.primaryRole,
    category,
    suburb: reg.suburb || "Linden",
    businessName: reg.business_name,
    businessAddress: reg.business_address,
    mobile: reg.mobile,
    wantsWindowSticker: reg.wants_window_sticker,
    interests: reg.interests,
    details: reg.details,
    status: reg.claimed_at ? "Active" : "Pending",
    joinedDate: reg.created_at,
    lastLogin: reg.claimed_at || reg.created_at,
  }
}

export default async function RegistrationsPage() {
  const { categories, byId } = await getRegistrations()

  const users: RegistrationUser[] = Array.from(byId.values()).map(mapToUser)

  const initialCounts = {
    total: users.length,
    neighbours: categories.find((c) => c.id === "founding_neighbour")?.count ?? 0,
    businesses: categories.find((c) => c.id === "founding_business")?.count ?? 0,
    pending: users.filter((u) => u.status === "Pending").length,
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Registrations</h1>
        <p className="text-sm text-muted-foreground">
          Manage website sign-ups, community applicants, and partner interest from hellohyperlocal.co.za.
        </p>
      </div>

      <RegistrationsClient initialUsers={users} initialCounts={initialCounts} />
    </div>
  )
}
