"use client";

import * as React from "react";
import { UploadCloudIcon, Trash2Icon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "cn";
import { toast } from "sonner";

interface AvatarUploaderProps {
  label?: string;
  sublabel?: string;
  initialUrl?: string | null;
  nameFallback?: string;
  folder?: string;
  onUploaded: (url: string | null) => void;
  className?: string;
}

export function AvatarUploader({
  label = "Avatar photo",
  sublabel = "Pick a photo up to 10MB. It will be compressed automatically.",
  initialUrl = null,
  nameFallback = "HL",
  folder = "avatars",
  onUploaded,
  className,
}: AvatarUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = React.useState<string | null>(initialUrl);
  const [prevInitialUrl, setPrevInitialUrl] = React.useState<string | null>(initialUrl);
  const [isUploading, setIsUploading] = React.useState(false);

  if (prevInitialUrl !== initialUrl) {
    setPrevInitialUrl(initialUrl);
    setPreview(initialUrl);
  }

  const initials =
    nameFallback
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "HL";


  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, WebP)");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file must be under 10MB");
      e.target.value = "";
      return;
    }

    try {
      setIsUploading(true);
      const localPreviewUrl = URL.createObjectURL(file);
      setPreview(localPreviewUrl);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await res.json();
      setPreview(data.url);
      onUploaded(data.url);
      toast.success("Avatar uploaded and compressed!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload avatar";
      toast.error(msg);
      setPreview(initialUrl);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploaded(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <div className="flex items-center gap-4">
        {/* Avatar Display */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          className="group relative flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border/80 bg-muted/40 transition-all hover:border-primary hover:opacity-90"
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-1 text-primary">
              <Loader2Icon className="size-6 animate-spin" />
            </div>
          ) : preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Avatar" className="size-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-sm font-semibold text-muted-foreground group-hover:text-primary">
              {initials}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSelect}
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="gap-1.5"
          >
            <UploadCloudIcon className="size-4" />
            {preview ? "Change avatar" : "Upload avatar"}
          </Button>

          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
            >
              <Trash2Icon className="size-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
      {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  );
}
