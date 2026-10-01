import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ListingsLoading() {
  return (
    <div className="min-w-0 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Table Card */}
      <Card className="p-4 space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <Skeleton className="h-9 w-full sm:w-72 rounded-md" />
          <Skeleton className="h-9 w-full sm:w-48 rounded-md" />
        </div>

        {/* Table Rows */}
        <div className="rounded-md border divide-y">
          {/* Header */}
          <div className="flex items-center px-4 py-3 bg-muted/40 gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-4 w-40 hidden md:block" />
            <Skeleton className="h-4 w-16 hidden sm:block" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>

          {/* Rows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center px-4 py-3.5 gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Skeleton className="size-9 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-36 max-w-full" />
                  <Skeleton className="h-3 w-48 max-w-full sm:hidden" />
                </div>
              </div>
              <Skeleton className="h-5 w-24 rounded-full hidden sm:block" />
              <Skeleton className="h-4 w-36 hidden md:block" />
              <Skeleton className="h-4 w-12 hidden sm:block" />
              <Skeleton className="h-6 w-16 rounded-full ml-auto" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
