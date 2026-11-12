"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploader } from "@/components/media/file-uploader";
import { toast } from "sonner";
import { createProjectAction, updateProjectAction } from "../actions";
import {
  PROJECT_CATEGORIES,
  type CommunityProject,
  type ProjectStatus,
} from "@/lib/community-projects-types";
import { Loader2, Plus, Sparkles } from "lucide-react";

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: CommunityProject | null;
  onSuccess?: () => void;
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: ProjectFormDialogProps) {
  const isEditing = Boolean(project);
  const [isPending, startTransition] = React.useTransition();

  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("Infrastructure");
  const [organizerName, setOrganizerName] = React.useState("Linden Community Association");
  const [targetAmount, setTargetAmount] = React.useState("25000");
  const [currentAmountRaised, setCurrentAmountRaised] = React.useState("0");
  const [status, setStatus] = React.useState<ProjectStatus>("active");
  const [deadline, setDeadline] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [imageMode, setImageMode] = React.useState<"upload" | "url">("upload");

  React.useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setCategory(project.category || "Infrastructure");
      setOrganizerName(project.organizer_name || "Linden Community Association");
      setTargetAmount(String(project.target_amount || "0"));
      setCurrentAmountRaised(String(project.current_amount_raised || "0"));
      setStatus(project.status || "active");
      setDeadline(
        project.deadline ? new Date(project.deadline).toISOString().split("T")[0] : ""
      );
      setImageUrl(project.image_url || "");
      setDescription(project.description || "");
    } else {
      setTitle("");
      setCategory("Infrastructure");
      setOrganizerName("Linden Community Association");
      setTargetAmount("25000");
      setCurrentAmountRaised("0");
      setStatus("active");
      setDeadline("");
      setImageUrl("");
      setDescription("");
    }
  }, [project, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Project title is required.");
      return;
    }
    if (!description.trim()) {
      toast.error("Project description is required.");
      return;
    }
    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      toast.error("Please enter a valid target budget greater than R0.");
      return;
    }

    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("category", category);
    formData.set("organizer_name", organizerName.trim());
    formData.set("target_amount", targetAmount);
    formData.set("current_amount_raised", currentAmountRaised || "0");
    formData.set("status", status);
    formData.set("deadline", deadline);
    formData.set("image_url", imageUrl.trim());
    formData.set("description", description.trim());
    formData.set("suburb_slug", "linden");

    startTransition(async () => {
      if (isEditing && project) {
        const res = await updateProjectAction(project.id, formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Community project updated successfully.");
          onOpenChange(false);
          onSuccess?.();
        }
      } else {
        const res = await createProjectAction(formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Community project published successfully.");
          onOpenChange(false);
          onSuccess?.();
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {isEditing ? (
              "Edit Community Project"
            ) : (
              <>
                <Plus className="size-4 text-primary" />
                Create New Community Project
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Update project specifications, funding progress, and resident engagement details."
              : "Launch a new neighborhood initiative for residents in the Hello Linden app feed."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="project-title" className="text-xs font-semibold">
              Project Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Linden Park Solar Security Lighting"
              required
              className="text-sm"
            />
          </div>

          {/* Category & Status */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status</Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as ProjectStatus)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Accepting inquiries)</SelectItem>
                  <SelectItem value="funded">100% Funded</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Organizer & Deadline */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="organizer" className="text-xs font-semibold">
                Organizer / Initiative Leader <span className="text-destructive">*</span>
              </Label>
              <Input
                id="organizer"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="e.g. Linden Community Safety Forum"
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deadline" className="text-xs font-semibold">
                Target Deadline (Optional)
              </Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Target Budget & Current Raised */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="target-budget" className="text-xs font-semibold">
                Target Budget (ZAR) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  R
                </span>
                <Input
                  id="target-budget"
                  type="number"
                  min="1"
                  step="100"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="25000"
                  required
                  className="pl-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="raised-budget" className="text-xs font-semibold">
                Current Raised (ZAR)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  R
                </span>
                <Input
                  id="raised-budget"
                  type="number"
                  min="0"
                  step="100"
                  value={currentAmountRaised}
                  onChange={(e) => setCurrentAmountRaised(e.target.value)}
                  placeholder="0"
                  className="pl-8 text-sm"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Manually record offline donations, sponsorships, or corporate grants.
              </p>
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Cover Photo</Label>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageMode("upload")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    imageMode === "upload"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upload File
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    imageMode === "url"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {imageMode === "upload" ? (
              <FileUploader
                folder="community-projects"
                maxFiles={1}
                maxSizeMB={10}
                acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
                initialUrls={imageUrl ? [imageUrl] : []}
                onUploadComplete={(urls) => setImageUrl(urls[0] || "")}
                onRemove={() => setImageUrl("")}
              />
            ) : (
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="text-xs"
              />
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold">
              Full Description &amp; Scope <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the project roadmap, purpose, benefits for Linden, and what volunteers or materials are needed..."
              rows={4}
              required
              className="text-sm resize-y"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#1c472a] hover:bg-[#163d23] text-white"
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
