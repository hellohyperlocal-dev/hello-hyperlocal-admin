import { Card, CardContent } from "@/components/ui/card"
import { Users, Store, Home, ShieldCheck, TrendingUp, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface UserStatCounts {
  total: number
  residents: number
  businesses: number
  councillors: number
  suspended: number
}

interface UserStatCardsProps {
  counts: UserStatCounts
}

export function UserStatCards({ counts }: UserStatCardsProps) {
  const residentPercent = counts.total > 0 ? Math.round((counts.residents / counts.total) * 100) : 0
  const businessPercent = counts.total > 0 ? Math.round((counts.businesses / counts.total) * 100) : 0
  const activePercent = counts.total > 0 ? Math.round(((counts.total - counts.suspended) / counts.total) * 100) : 100

  const metrics = [
    {
      title: "Total Users",
      current: counts.total.toLocaleString(),
      subtext: "Registered app accounts",
      growth: 100,
      icon: Users,
    },
    {
      title: "Residents",
      current: counts.residents.toLocaleString(),
      subtext: `${residentPercent}% of community members`,
      growth: residentPercent,
      icon: Home,
    },
    {
      title: "Local Businesses",
      current: counts.businesses.toLocaleString(),
      subtext: `${businessPercent}% commercial accounts`,
      growth: businessPercent,
      icon: Store,
    },
    {
      title: "Active Accounts",
      current: (counts.total - counts.suspended).toLocaleString(),
      subtext: `${activePercent}% good standing`,
      growth: activePercent,
      icon: ShieldCheck,
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
