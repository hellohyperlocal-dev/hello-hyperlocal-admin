"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { removeAdminAccess } from "./actions";
import { Button } from "@/components/ui/button";

export function RemoveAccessButton({ id, isSelf }: { id: string; isSelf: boolean }) {
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      const result = await removeAdminAccess(id);
      if (result.error) toast.error(result.error);
      else toast.success("Admin access removed.");
    });
  }

  if (isSelf) return null;

  return (
    <Button size="sm" variant="destructive" onClick={handleRemove} disabled={pending}>
      {pending ? "Removing…" : "Remove access"}
    </Button>
  );
}
