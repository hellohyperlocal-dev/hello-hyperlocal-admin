import { Card, CardContent } from "@/components/ui/card"
import { HeartHandshake, TrendingUp, MessageSquareText, Users, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ProjectStatCounts {
  totalProjects: number
  activeProjects: number
  totalTarget: number
  totalRaised: number
  totalInquiries: number
  newInquiries: number
  totalSupporters: number
}

interface ProjectStatCardsProps {
  counts: ProjectStatCounts
}

export function ProjectStatCards({ counts }: ProjectStatCardsProps) {
  const fundingPercent =
    counts.totalTarget > 0
      ? Math.round((counts.totalRaised / counts.totalTarget) * 100)
      : 0

  const activePercent =
    counts.totalProjects > 0
      ? Math.round((counts.activeProjects / counts.totalProjects) * 100)
      : 100

  const formattedRaised = `R${counts.totalRaised.toLocaleString("en-ZA")}`
  const formattedTarget = `R${counts.totalTarget.toLocaleString("en-ZA")}`

  const metrics = [
    {
      title: "Total Projects",
      current: counts.totalProjects.toLocaleString(),
      subtext: `${counts.activeProjects} active initiatives`,
      growth: activePercent,
      icon: HeartHandshake,
    },
    {
      title: "Funding Progress",
      current: formattedRaised,
      subtext: `${fundingPercent}% of ${formattedTarget}`,
      growth: fundingPercent,
      icon: TrendingUp,
    },
    {
      title: "Resident Inquiries",
      current: counts.totalInquiries.toLocaleString(),
      subtext: `${counts.newInquiries} new leads awaiting contact`,
      growth: counts.newInquiries > 0 ? counts.newInquiries : 0,
      icon: MessageSquareText,
    },
    {
      title: "Community Supporters",
      current: counts.totalSupporters.toLocaleString(),
      subtext: "Resident pledges & backers",
      growth: counts.totalSupporters > 0 ? 100 : 0,
      icon: Users,
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
                className={cn("border-border bg-muted/50 text-foreground")}
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
