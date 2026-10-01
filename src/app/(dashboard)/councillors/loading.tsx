import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CouncillorsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      {/* Active Councillors Card */}
      <Card className="p-6 space-y-4">
        <Skeleton className="h-4 w-36" />
        <div className="divide-y rounded-md border">
          <div className="flex items-center px-4 py-3 bg-muted/40 gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center px-4 py-3 gap-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24 ml-auto" />
            </div>
          ))}
        </div>
      </Card>

      {/* Invitations Card */}
      <Card className="p-6 space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="divide-y rounded-md border">
          <div className="flex items-center px-4 py-3 bg-muted/40 gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center px-4 py-3 gap-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24 ml-auto" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
