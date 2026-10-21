"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Pencil,
  Undo2,
  Redo2,
  Monitor,
  Smartphone,
  Send,
  Download,
  Eye,
  Check,
  Loader2,
  ChevronDown,
  Mail,
  Copy,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DesignerHeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  viewport: "desktop" | "mobile";
  onViewportChange: (viewport: "desktop" | "mobile") => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  saveStatus: "idle" | "saving" | "saved" | "unsaved";
  onOpenTestEmail: () => void;
  onOpenExportDialog: () => void;
  onCopyHtml: () => void;
  onDownloadHtml: () => void;
}

export function DesignerHeader({
  title,
  onTitleChange,
  viewport,
  onViewportChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  saveStatus,
  onOpenTestEmail,
  onOpenExportDialog,
  onCopyHtml,
  onDownloadHtml,
}: DesignerHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);

  const handleFinishEditing = () => {
    setIsEditingTitle(false);
    if (localTitle.trim() && localTitle !== title) {
      onTitleChange(localTitle.trim());
    } else {
      setLocalTitle(title);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <header className="h-14 border-b bg-card px-4 flex items-center justify-between gap-3 shrink-0 shadow-2xs z-20">
        {/* Left Section: Back, Title, Email Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Button variant="ghost" size="icon" asChild className="size-8 rounded-md text-muted-foreground hover:text-foreground">
            <Link href="/email-designer" title="Back to Templates">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>

          {isEditingTitle ? (
            <Input
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleFinishEditing}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFinishEditing();
                if (e.key === "Escape") {
                  setLocalTitle(title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="h-8 w-56 text-sm font-semibold px-2 py-0"
            />
          ) : (
            <button
              onClick={() => {
                setLocalTitle(title);
                setIsEditingTitle(true);
              }}
              className="group flex items-center gap-1.5 px-2 py-1 -ml-1 rounded-md hover:bg-muted/70 transition-colors text-left"
              title="Click to rename"
            >
              <span className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-[320px]">
                {title || "Untitled Email"}
              </span>
              <Pencil className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          <Badge variant="outline" className="hidden sm:inline-flex bg-primary/10 text-[#1C472A] border-primary/20 text-[11px] font-medium gap-1 px-2 py-0.5">
            <Mail className="size-3 text-primary" />
            Email
          </Badge>
        </div>

        {/* Center Section: History & Viewport Switcher */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center border rounded-md p-0.5 bg-muted/40">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-sm"
                  onClick={onUndo}
                  disabled={!canUndo}
                >
                  <Undo2 className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Undo</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-sm"
                  onClick={onRedo}
                  disabled={!canRedo}
                >
                  <Redo2 className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Redo</TooltipContent>
            </Tooltip>
          </div>

          {/* Viewport switch: Desktop / Mobile */}
          <div className="flex items-center border rounded-md p-0.5 bg-muted/40">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewport === "desktop" ? "secondary" : "ghost"}
                  size="icon"
                  className={`size-7 rounded-sm ${viewport === "desktop" ? "bg-background shadow-xs text-foreground font-semibold" : "text-muted-foreground"}`}
                  onClick={() => onViewportChange("desktop")}
                >
                  <Monitor className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Desktop View</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewport === "mobile" ? "secondary" : "ghost"}
                  size="icon"
                  className={`size-7 rounded-sm ${viewport === "mobile" ? "bg-background shadow-xs text-foreground font-semibold" : "text-muted-foreground"}`}
                  onClick={() => onViewportChange("mobile")}
                >
                  <Smartphone className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Mobile View (375px)</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Right Section: Actions, Save & Export */}
        <div className="flex items-center gap-2">
          {/* Save Status / Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={saveStatus === "saving"}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="size-3.5 text-green-600" />
                Saved
              </>
            ) : (
              "Save"
            )}
          </Button>

          {/* Send Test Email Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenTestEmail}
                className="h-8 gap-1.5 text-xs text-foreground hidden sm:inline-flex"
              >
                <Send className="size-3.5 text-[#1C472A]" />
                Send Test
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Send real test email to an inbox</TooltipContent>
          </Tooltip>

          {/* Preview / HTML Dialog Trigger */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onOpenExportDialog}
                className="size-8 hidden sm:inline-flex"
              >
                <Eye className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Preview & Code View</TooltipContent>
          </Tooltip>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="h-8 bg-[#1C472A] text-white hover:bg-[#1C472A]/90 gap-1 text-xs font-medium px-3 shadow-2xs"
              >
                Export
                <ChevronDown className="size-3.5 opacity-80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onOpenExportDialog} className="gap-2 text-xs">
                <FileCode className="size-3.5 text-muted-foreground" />
                Preview & Code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopyHtml} className="gap-2 text-xs">
                <Copy className="size-3.5 text-muted-foreground" />
                Copy HTML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownloadHtml} className="gap-2 text-xs">
                <Download className="size-3.5 text-muted-foreground" />
                Download HTML (.html)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenTestEmail} className="gap-2 text-xs">
                <Send className="size-3.5 text-muted-foreground" />
                Send Test Email
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2 text-xs">
                <Link href="/mail">
                  <Mail className="size-3.5 text-muted-foreground" />
                  Open in Mail App
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
}
