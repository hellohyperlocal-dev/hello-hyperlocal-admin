"use client";

import * as React from "react";
import { UploadCloudIcon, XIcon, CheckCircle2Icon, AlertCircleIcon, FileImageIcon, Loader2Icon } from "lucide-react";
import { cn } from "cn";
import { Progress } from "@/components/ui/progress";

export interface MediaUploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "completed" | "failed";
  error?: string;
  url?: string;
  compressedSize?: number;
}

interface FileUploaderProps {
  folder?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFileTypes?: string[];
  onUploadComplete?: (urls: string[]) => void;
  onRemove?: (url: string) => void;
  initialUrls?: string[];
  className?: string;
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function FileUploader({
  folder = "uploads",
  maxFiles = 6,
  maxSizeMB = 10,
  acceptedFileTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  onUploadComplete,
  onRemove,
  initialUrls = [],
  className,
}: FileUploaderProps) {
  const [items, setItems] = React.useState<MediaUploadItem[]>([]);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const activeUploads = items.filter((i) => i.status === "uploading");
  const failedUploads = items.filter((i) => i.status === "failed");
  const completedUploads = items.filter((i) => i.status === "completed");

  const totalCount = initialUrls.length + completedUploads.length + activeUploads.length;

  const uploadFile = async (item: MediaUploadItem) => {
    try {
      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("folder", folder);

      const progressInterval = setInterval(() => {
        setItems((prev) =>
          prev.map((i) => {
            if (i.id === item.id && i.status === "uploading" && i.progress < 85) {
              return { ...i, progress: i.progress + 15 };
            }
            return i;
          })
        );
      }, 150);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();

      setItems((prev) => {
        const next = prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                progress: 100,
                status: "completed" as const,
                url: data.url,
                compressedSize: data.compressedSize,
              }
            : i
        );

        const allCompleted = next
          .filter((i) => i.status === "completed" && i.url)
          .map((i) => i.url as string);

        if (onUploadComplete) {
          onUploadComplete([...initialUrls, ...allCompleted]);
        }

        return next;
      });
    } catch (err: any) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: "failed",
                error: err.message || "Upload failed",
                progress: 100,
              }
            : i
        )
      );
    }
  };

  const handleFiles = (incomingFiles: FileList | File[]) => {
    const fileArray = Array.from(incomingFiles);

    if (totalCount + fileArray.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files.`);
      return;
    }

    const newItems: MediaUploadItem[] = fileArray.map((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const exceedsSize = file.size > maxSizeMB * 1024 * 1024;
      const invalidType = !acceptedFileTypes.includes(file.type);

      if (exceedsSize) {
        return {
          id,
          file,
          name: file.name,
          size: file.size,
          progress: 100,
          status: "failed",
          error: `The file exceeds the ${maxSizeMB} MB size limit.`,
        };
      }

      if (invalidType) {
        return {
          id,
          file,
          name: file.name,
          size: file.size,
          progress: 100,
          status: "failed",
          error: "File type is not supported. Please choose an image.",
        };
      }

      return {
        id,
        file,
        name: file.name,
        size: file.size,
        progress: 10,
        status: "uploading",
      };
    });

    setItems((prev) => [...prev, ...newItems]);

    newItems.forEach((item) => {
      if (item.status === "uploading") {
        uploadFile(item);
      }
    });
  };

  const removeItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (target?.url && onRemove) {
      onRemove(target.url);
    }
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files?.length) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200",
          isDragOver
            ? "border-primary bg-primary/5 shadow-xs scale-[0.99]"
            : "border-border/70 hover:border-primary/50 hover:bg-muted/40"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes.join(",")}
          multiple={maxFiles > 1}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              handleFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />

        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
          <UploadCloudIcon className="size-6" />
        </div>

        <p className="text-sm font-semibold text-foreground">
          Drag & Drop or <span className="text-primary hover:underline">Choose file to upload</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Max {maxFiles} {maxFiles === 1 ? "file" : "files"} • Up to {maxSizeMB}MB
        </p>
      </div>

      {activeUploads.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <Loader2Icon className="size-3.5 animate-spin text-primary" />
            <span>Uploading</span>
          </div>
          <div className="space-y-2">
            {activeUploads.map((item) => (
              <div
                key={item.id}
                className="relative flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/40 p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border/70">
                      <FileImageIcon className="size-4 text-foreground/70" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground text-xs">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">{formatBytes(item.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">{item.progress}%</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                </div>
                <Progress value={item.progress} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {completedUploads.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-primary uppercase">
            <CheckCircle2Icon className="size-3.5" />
            <span>Uploaded & Compressed ({completedUploads.length})</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {completedUploads.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.url && (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="size-9 shrink-0 rounded-lg object-cover border border-border/50"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.compressedSize ? (
                        <>
                          <span className="text-primary font-medium">{formatBytes(item.compressedSize)}</span>
                          <span className="line-through ml-1 text-muted-foreground/70">{formatBytes(item.size)}</span>
                        </>
                      ) : (
                        formatBytes(item.size)
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {failedUploads.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-destructive uppercase">
            <AlertCircleIcon className="size-3.5" />
            <span>Failed</span>
          </div>
          <div className="space-y-2">
            {failedUploads.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileImageIcon className="size-4 text-destructive shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{item.name}</p>
                      <p className="text-[11px] text-destructive font-medium">{formatBytes(item.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-destructive">
                  <AlertCircleIcon className="size-3 shrink-0" />
                  <span>{item.error || "Failed to upload."}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-destructive/20">
                  <div className="h-full w-full bg-destructive" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
