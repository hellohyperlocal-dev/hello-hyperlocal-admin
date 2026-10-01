import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WardUpdatesLoading() {
  return (
    <div className="min-w-0 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>

      {/* Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="divide-y">
          {/* Table Header */}
          <div className="flex items-center px-4 py-3 bg-muted/40 gap-4">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-4 w-20 hidden md:block" />
            <Skeleton className="h-4 w-32 hidden lg:block" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>

          {/* Table Rows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center px-4 py-3.5 gap-4">
              <div className="flex-1 space-y-1.5 min-w-0">
                <Skeleton className="h-4 w-48 max-w-full" />
                <Skeleton className="h-3 w-28 sm:hidden" />
              </div>
              <Skeleton className="h-4 w-24 hidden sm:block" />
              <Skeleton className="h-4 w-20 hidden md:block" />
              <Skeleton className="h-4 w-32 hidden lg:block" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
