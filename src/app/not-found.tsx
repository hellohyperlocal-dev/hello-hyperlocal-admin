import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] w-full flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="font-heading text-8xl font-black tracking-tighter text-primary/80 sm:text-9xl">
        404
      </h1>
      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Page not found</h2>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t find the page you are looking for. It may have been moved, renamed, or is temporarily unavailable.
        </p>
      </div>
      <Button asChild className="gap-2 rounded-full px-6 bg-[#1C472A] text-white hover:bg-[#1C472A]/90">
        <Link href="/">
          <HomeIcon className="size-4 text-[#7ED957]" />
          Go back to home
        </Link>
      </Button>
    </div>
  );
}
