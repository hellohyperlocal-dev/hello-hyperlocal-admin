import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ModerationLoading() {
  return (
    <div className="min-w-0 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-44 rounded-md" />
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Skeleton className="h-8 w-24 rounded-full shrink-0" />
        <Skeleton className="h-8 w-28 rounded-full shrink-0" />
        <Skeleton className="h-8 w-32 rounded-full shrink-0" />
        <Skeleton className="h-8 w-24 rounded-full shrink-0" />
      </div>

      {/* Inbox Split Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px]">
        {/* Left List Pane */}
        <Card className="lg:col-span-5 p-0 divide-y overflow-hidden h-full flex flex-col">
          <div className="p-3 border-b bg-muted/20">
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
          <div className="divide-y overflow-y-auto flex-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-48 max-w-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </Card>

        {/* Right Detail Pane */}
        <Card className="hidden lg:flex lg:col-span-7 p-6 flex-col justify-between h-full space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            <Skeleton className="aspect-video w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t">
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </Card>
      </div>
    </div>
  );
}
