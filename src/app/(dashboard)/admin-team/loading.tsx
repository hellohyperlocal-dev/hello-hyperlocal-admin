import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminTeamLoading() {
  return (
    <div className="min-w-0 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Active Admins Card */}
      <Card className="p-6 space-y-4">
        <Skeleton className="h-4 w-28" />
        <div className="divide-y rounded-md border">
          <div className="flex items-center px-4 py-3 bg-muted/40 gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center px-4 py-3 gap-4">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16 rounded-md ml-auto" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
