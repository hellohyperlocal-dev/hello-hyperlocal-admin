import { Card, CardContent } from "@/components/ui/card"
import { Store, Clock, ShoppingBag, Tag, TrendingUp, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface BusinessStatCounts {
  totalBusinesses: number
  openBusinesses: number
  totalMarketplace: number
  totalOffers: number
}

interface BusinessStatCardsProps {
  counts: BusinessStatCounts
}

export function BusinessStatCards({ counts }: BusinessStatCardsProps) {
  const openPercent =
    counts.totalBusinesses > 0
      ? Math.round((counts.openBusinesses / counts.totalBusinesses) * 100)
      : 0

  const metrics = [
    {
      title: "Total Businesses",
      current: counts.totalBusinesses.toLocaleString(),
      subtext: "Verified directory listings",
      growth: 100,
      icon: Store,
    },
    {
      title: "Open Now",
      current: counts.openBusinesses.toLocaleString(),
      subtext: `${openPercent}% currently operating`,
      growth: openPercent,
      icon: Clock,
    },
    {
      title: "Marketplace Ads",
      current: counts.totalMarketplace.toLocaleString(),
      subtext: "Resident classified listings",
      growth: counts.totalMarketplace > 0 ? 100 : 0,
      icon: ShoppingBag,
    },
    {
      title: "Love Local Specials",
      current: counts.totalOffers.toLocaleString(),
      subtext: "Active promotions & deals",
      growth: counts.totalOffers > 0 ? 100 : 0,
      icon: Tag,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="border">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <metric.icon className="text-muted-foreground size-6" />
              <Badge
                variant="outline"
                className="border-border bg-muted/50 text-foreground"
              >
                <TrendingUp className="me-1 size-3" />
                {metric.growth}%
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">{metric.title}</p>
              <div className="text-2xl font-bold">{metric.current}</div>
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <span>{metric.subtext}</span>
                <ArrowUpRight className="size-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
