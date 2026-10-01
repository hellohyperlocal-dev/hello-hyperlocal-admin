import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmailTemplatesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>

      {/* Main Grid: Sidebar List + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Template List */}
        <Card className="lg:col-span-4 p-4 space-y-3">
          <Skeleton className="h-4 w-32 mb-2" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg border space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-3 w-48 max-w-full" />
            </div>
          ))}
        </Card>

        {/* Email Preview Pane */}
        <Card className="lg:col-span-8 p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
          <div className="mx-auto max-w-md border rounded-xl p-6 space-y-4 bg-muted/10">
            <Skeleton className="size-12 rounded-full mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-10 w-36 mx-auto rounded-md" />
          </div>
        </Card>
      </div>
    </div>
  );
}
