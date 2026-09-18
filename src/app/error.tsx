"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircleIcon, RotateCcwIcon, HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Dashboard error caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-xs">
        <AlertCircleIcon className="size-8" />
      </div>

      <div className="max-w-md space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          {error?.message || "An unexpected error occurred while loading this page or component. Please try again or return home."}
        </p>
        {error?.digest && (
          <p className="font-mono text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <RotateCcwIcon className="size-4" />
          Try again
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <Link href="/">
            <HomeIcon className="size-4" />
            Go back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}
