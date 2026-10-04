import { Card, CardContent } from "@/components/ui/card"
import { Users, Store, Home, Clock5, TrendingUp, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface StatCounts {
  total: number
  neighbours: number
  businesses: number
  pending: number
}

interface StatCardsProps {
  counts: StatCounts
}

export function StatCards({ counts }: StatCardsProps) {
  const neighbourPercent = counts.total > 0 ? Math.round((counts.neighbours / counts.total) * 100) : 0
  const businessPercent = counts.total > 0 ? Math.round((counts.businesses / counts.total) * 100) : 0
  const pendingPercent = counts.total > 0 ? Math.round((counts.pending / counts.total) * 100) : 0

  const metrics = [
    {
      title: "Total Registrations",
      current: counts.total.toLocaleString(),
      subtext: "From website sign-ups",
      growth: 100,
      icon: Users,
    },
    {
      title: "Founding Neighbours",
      current: counts.neighbours.toLocaleString(),
      subtext: `${neighbourPercent}% of total community`,
      growth: neighbourPercent,
      icon: Home,
    },
    {
      title: "Founding Businesses",
      current: counts.businesses.toLocaleString(),
      subtext: `${businessPercent}% local commerce`,
      growth: businessPercent,
      icon: Store,
    },
    {
      title: "Pending Claims",
      current: counts.pending.toLocaleString(),
      subtext: `${pendingPercent}% awaiting onboarding`,
      growth: pendingPercent,
      icon: Clock5,
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
                className={cn(
                  "border-border bg-muted/50 text-foreground"
                )}
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
