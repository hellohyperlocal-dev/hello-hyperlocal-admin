import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-6 w-28" />
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="py-0">
            <div className="p-6 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-20" />
            </div>
          </Card>
        ))}
      </div>

      {/* Traffic Chart Card */}
      <Card className="p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </Card>
    </div>
  );
}
