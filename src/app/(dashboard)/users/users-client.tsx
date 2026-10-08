"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserStatCards, type UserStatCounts } from "./components/user-stat-cards"
import { UserDataTable } from "./components/user-data-table"
import type { UserRow } from "@/lib/users"

interface UsersClientProps {
  initialUsers: UserRow[]
  initialCounts: UserStatCounts
}

export function UsersClient({ initialUsers, initialCounts }: UsersClientProps) {
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>(initialUsers)

  const handleUpdateUser = (updated: UserRow) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
  }

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  const handleUserAdded = () => {
    router.refresh()
  }

  const counts: UserStatCounts = {
    total: users.length,
    residents: users.filter((u) => u.role === "resident").length,
    businesses: users.filter((u) => u.role === "business" || Boolean(u.business_name)).length,
    councillors: users.filter((u) => u.role === "councillor" || u.role === "admin" || u.role === "staff").length,
    suspended: users.filter((u) => u.is_suspended).length,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main">
        <UserStatCards counts={counts} />
      </div>

      <div className="@container/main mt-6 lg:mt-8">
        <UserDataTable
          users={users}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onUserAdded={handleUserAdded}
        />
      </div>
    </div>
  )
}
