"use client"

import { useState } from "react"
import { StatCards, type StatCounts } from "./components/stat-cards"
import { DataTable, type RegistrationUser } from "./components/data-table"
import type { UserFormValues } from "./components/user-form-dialog"
import { toast } from "sonner"

interface RegistrationsClientProps {
  initialUsers: RegistrationUser[]
  initialCounts: StatCounts
}

export function RegistrationsClient({ initialUsers, initialCounts }: RegistrationsClientProps) {
  const [users, setUsers] = useState<RegistrationUser[]>(initialUsers)

  const generateAvatar = (name: string) => {
    const names = name.split(" ").filter(Boolean)
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase() || "U"
  }

  const handleAddUser = (userData: UserFormValues) => {
    const rawRole = userData.role.toLowerCase().replace(/\s+/g, "_")
    const newUser: RegistrationUser = {
      id: `manual-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile?.trim() || null,
      businessName: userData.businessName?.trim() || null,
      avatar: generateAvatar(userData.name),
      role: userData.role,
      rawRole,
      category: userData.category || (userData.role.includes("Business") ? "Business" : "Resident"),
      suburb: userData.suburb || "Linden",
      status: (userData.status as "Active" | "Pending") || "Pending",
      joinedDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }
    setUsers((prev) => [newUser, ...prev])
    toast.success(`User "${userData.name}" added successfully.`)
  }

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id))
    toast.success("User deleted successfully.")
  }

  const handleEditUser = (user: RegistrationUser) => {
    console.log("Edit user:", user)
    toast.info(`Edit user: ${user.name}`)
  }

  const counts: StatCounts = {
    total: users.length,
    neighbours: users.filter((u) => u.rawRole === "founding_neighbour" || u.role.includes("Neighbour")).length,
    businesses: users.filter((u) => u.rawRole === "founding_business" || u.role.includes("Business")).length,
    pending: users.filter((u) => u.status === "Pending").length,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main">
        <StatCards counts={counts} />
      </div>

      <div className="@container/main mt-6 lg:mt-8">
        <DataTable
          users={users}
          onDeleteUser={handleDeleteUser}
          onEditUser={handleEditUser}
          onAddUser={handleAddUser}
        />
      </div>
    </div>
  )
}
