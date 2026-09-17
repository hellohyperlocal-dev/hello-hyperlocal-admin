"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { unpublishListing } from "./actions";
import { Button } from "@/components/ui/button";

export function UnpublishButton({ table, id, status }: { table: "marketplace_listings" | "love_local_offers"; id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await unpublishListing(table, id);
      if (result.error) toast.error(result.error);
      else toast.success("Unpublished.");
    });
  }

  if (status === "rejected") return null;

  return (
    <Button size="sm" variant="destructive" onClick={handleClick} disabled={pending}>
      {pending ? "Please wait…" : "Unpublish"}
    </Button>
  );
}
