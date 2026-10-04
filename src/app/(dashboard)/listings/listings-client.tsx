"use client"

import { useState } from "react"
import { BusinessStatCards } from "./components/business-stat-cards"
import { BusinessDataTable } from "./components/business-data-table"
import type {
  BusinessRow,
  ListingRow,
  LoveLocalOfferRow,
} from "@/lib/listings-types"

interface ListingsClientProps {
  initialBusinesses: BusinessRow[]
  initialMarketplace: ListingRow[]
  initialLoveLocal: LoveLocalOfferRow[]
}

export function ListingsClient({
  initialBusinesses,
  initialMarketplace,
  initialLoveLocal,
}: ListingsClientProps) {
  const [businesses, setBusinesses] = useState<BusinessRow[]>(initialBusinesses)

  const handleToggleBusiness = (id: string, isOpen: boolean) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, is_open: isOpen } : b))
    )
  }

  const handleDeleteBusiness = (id: string) => {
    setBusinesses((prev) => prev.filter((b) => b.id !== id))
  }

  const counts = {
    totalBusinesses: businesses.length,
    openBusinesses: businesses.filter((b) => b.is_open).length,
    totalMarketplace: initialMarketplace.length,
    totalOffers: initialLoveLocal.length,
  }

  return (
    <div className="space-y-6">
      {/* 4 Responsive Stat Cards */}
      <BusinessStatCards counts={counts} />

      {/* Dedicated Business Directory Table */}
      <BusinessDataTable
        businesses={businesses}
        onToggleStatus={handleToggleBusiness}
        onDelete={handleDeleteBusiness}
      />
    </div>
  )
}
