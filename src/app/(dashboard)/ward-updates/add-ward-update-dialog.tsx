"use client";

import { useState, useTransition } from "react";
import { Megaphone, Plus } from "lucide-react";
import { toast } from "sonner";
import { createWardUpdate } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CouncillorOption {
  id: string;
  full_name: string | null;
  ward: string | null;
}

interface Props {
  councillors: CouncillorOption[];
}

export function AddWardUpdateDialog({ councillors }: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("notice");
  const [councillorId, setCouncillorId] = useState(councillors[0]?.id || "");
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("category", category);
    if (councillorId) formData.set("councillorId", councillorId);
    formData.set("isPinned", String(isPinned));

    startTransition(async () => {
      const result = await createWardUpdate(formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success("Ward update broadcasted successfully.");
      setOpen(false);
      form.reset();
      setIsPinned(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" /> Add ward update
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Broadcast ward update</DialogTitle>
          <DialogDescription>
            Publish an official ward notice. This will appear immediately in the mobile app feed for residents in this ward.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notice">General Notice</SelectItem>
                  <SelectItem value="load-shedding">Load Shedding</SelectItem>
                  <SelectItem value="water">Water Outage</SelectItem>
                  <SelectItem value="road-closure">Road Closure</SelectItem>
                  <SelectItem value="safety">Safety Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ward">Ward</Label>
              <Input id="ward" name="ward" defaultValue="Ward 87" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Headline / Title</Label>
            <Input id="title" name="title" placeholder="e.g. Scheduled water maintenance on 4th Ave" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body">Message details</Label>
            <Textarea
              id="body"
              name="body"
              placeholder="Provide clear details, estimated restoration times, or contact numbers..."
              rows={4}
              required
            />
          </div>

          {councillors.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="councillor">Post as councillor</Label>
              <Select value={councillorId} onValueChange={setCouncillorId}>
                <SelectTrigger id="councillor">
                  <SelectValue placeholder="Select councillor" />
                </SelectTrigger>
                <SelectContent>
                  {councillors.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name || "Councillor"} ({c.ward || "Ward"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="imageUrl">Photo URL (optional)</Label>
            <Input id="imageUrl" name="imageUrl" placeholder="https://..." />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPinned"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="size-4 rounded border-border text-primary focus:ring-ring"
            />
            <Label htmlFor="isPinned" className="text-sm font-normal cursor-pointer">
              Pin to the top of the ward feed
            </Label>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Publishing…" : "Publish update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
