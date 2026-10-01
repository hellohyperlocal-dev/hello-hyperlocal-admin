import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersLoading() {
  return (
    <div className="min-w-0 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Filter Tabs / Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-full sm:w-64 rounded-md" />
      </div>

      {/* Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="divide-y">
          {/* Table Header */}
          <div className="flex items-center px-4 py-3 bg-muted/40 gap-4">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-20 hidden sm:block" />
            <Skeleton className="h-4 w-28 hidden md:block" />
            <Skeleton className="h-4 w-24 hidden lg:block" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>

          {/* Table Rows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center px-4 py-3.5 gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-32 max-w-full" />
                  <Skeleton className="h-3 w-40 max-w-full sm:hidden" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 rounded-full hidden sm:block" />
              <Skeleton className="h-4 w-28 hidden md:block" />
              <Skeleton className="h-4 w-20 hidden lg:block" />
              <Skeleton className="h-8 w-20 rounded-md ml-auto" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
