"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BusinessStatCards } from "./components/business-stat-cards"
import { BusinessDataTable } from "./components/business-data-table"
import { MarketplaceDataTable } from "./components/marketplace-data-table"
import { OffersDataTable } from "./components/offers-data-table"
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
  const [activeTab, setActiveTab] = useState("businesses")
  const [businesses, setBusinesses] = useState<BusinessRow[]>(initialBusinesses)
  const [marketplace, setMarketplace] = useState<ListingRow[]>(initialMarketplace)
  const [loveLocal, setLoveLocal] = useState<LoveLocalOfferRow[]>(initialLoveLocal)

  // Local handlers for immediate optimistic feedback
  const handleToggleBusiness = (id: string, isOpen: boolean) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, is_open: isOpen } : b))
    )
  }

  const handleDeleteBusiness = (id: string) => {
    setBusinesses((prev) => prev.filter((b) => b.id !== id))
  }

  const handleDeleteMarketplace = (id: string) => {
    setMarketplace((prev) => prev.filter((m) => m.id !== id))
  }

  const handleUnpublishMarketplace = (id: string) => {
    setMarketplace((prev) =>
      prev.map((m) => (m.id === id ? { ...m, moderation_status: "rejected" } : m))
    )
  }

  const handleDeleteOffer = (id: string) => {
    setLoveLocal((prev) => prev.filter((o) => o.id !== id))
  }

  const handleUnpublishOffer = (id: string) => {
    setLoveLocal((prev) =>
      prev.map((o) => (o.id === id ? { ...o, moderation_status: "rejected" } : o))
    )
  }

  const counts = {
    totalBusinesses: businesses.length,
    openBusinesses: businesses.filter((b) => b.is_open).length,
    totalMarketplace: marketplace.length,
    totalOffers: loveLocal.length,
  }

  return (
    <div className="space-y-6">
      {/* 4 Responsive Stat Cards */}
      <BusinessStatCards counts={counts} />

      {/* Tabs and Data Tables */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1">
          <TabsList className="w-full sm:w-auto inline-flex">
            <TabsTrigger value="businesses" className="flex-1 sm:flex-initial cursor-pointer">
              Businesses ({businesses.length})
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex-1 sm:flex-initial cursor-pointer">
              Marketplace ({marketplace.length})
            </TabsTrigger>
            <TabsTrigger value="love-local" className="flex-1 sm:flex-initial cursor-pointer">
              Love Local ({loveLocal.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="businesses" className="mt-4">
          <BusinessDataTable
            businesses={businesses}
            onToggleStatus={handleToggleBusiness}
            onDelete={handleDeleteBusiness}
          />
        </TabsContent>

        <TabsContent value="marketplace" className="mt-4">
          <MarketplaceDataTable
            listings={marketplace}
            onDelete={handleDeleteMarketplace}
            onUnpublish={handleUnpublishMarketplace}
          />
        </TabsContent>

        <TabsContent value="love-local" className="mt-4">
          <OffersDataTable
            offers={loveLocal}
            onDelete={handleDeleteOffer}
            onUnpublish={handleUnpublishOffer}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
