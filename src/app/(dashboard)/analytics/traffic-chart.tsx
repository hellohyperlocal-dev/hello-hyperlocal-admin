"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { DailyTraffic } from "@/lib/ga4";
import type { ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  sessions: { label: "Sessions", color: "var(--primary)" },
  pageViews: { label: "Page views", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function TrafficChart({ data }: { data: DailyTraffic[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fillSessions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-sessions)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-sessions)" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="fillPageViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-pageViews)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-pageViews)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(value: string) => new Date(value).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => new Date(value as string).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
            />
          }
        />
        <Area dataKey="sessions" type="monotone" fill="url(#fillSessions)" stroke="var(--color-sessions)" strokeWidth={2} />
        <Area dataKey="pageViews" type="monotone" fill="url(#fillPageViews)" stroke="var(--color-pageViews)" strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  );
}
