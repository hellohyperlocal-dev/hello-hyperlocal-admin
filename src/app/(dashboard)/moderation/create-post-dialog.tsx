"use client";

import { useState, useTransition } from "react";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { createCommunityPost } from "./actions";
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
import { FileUploader } from "@/components/media/file-uploader";

export function CreatePostDialog() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("hood");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("category", category);
    if (uploadedImageUrl) {
      formData.set("imageUrl", uploadedImageUrl);
    }

    startTransition(async () => {
      const result = await createCommunityPost(formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Community post published.");
      setOpen(false);
      setUploadedImageUrl("");
      form.reset();
      setCategory("hood");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <MessageSquarePlus className="size-4" /> Create community post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create community post</DialogTitle>
          <DialogDescription>
            Publish an announcement or community post directly. It will be pre-approved and visible immediately on all mobile devices.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="post-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="post-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hood">Neighbourhood / Hood</SelectItem>
                <SelectItem value="event">Community Event</SelectItem>
                <SelectItem value="lost-found">Lost &amp; Found</SelectItem>
                <SelectItem value="recommendation">Recommendation</SelectItem>
                <SelectItem value="job">Local Job</SelectItem>
                <SelectItem value="business">Business Mention</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-title">Post title</Label>
            <Input id="post-title" name="title" placeholder="e.g. Linden Spring Clean-up Day" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-content">Post content</Label>
            <Textarea
              id="post-content"
              name="content"
              placeholder="What would you like to share with the community?"
              rows={4}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Post photo (optional)</Label>
            <FileUploader
              folder="community-posts"
              maxFiles={1}
              maxSizeMB={10}
              onUploadComplete={(urls) => setUploadedImageUrl(urls[0] || "")}
              onRemove={() => setUploadedImageUrl("")}
            />
            {uploadedImageUrl && (
              <p className="text-xs text-primary font-medium">✓ Image ready to publish with post</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Publishing…" : "Publish post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
