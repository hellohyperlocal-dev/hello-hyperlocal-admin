"use client";

import { useState } from "react";
import {
  X,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet,
  Send,
  Copy,
  Download,
  Code,
  Check,
  Eye,
  FileJson,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { EmailDocument } from "@/lib/email-designer/types";

interface HtmlExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compiledHtml: string;
  document: EmailDocument;
  onOpenTestEmail?: () => void;
}

export function HtmlExportDialog({
  open,
  onOpenChange,
  compiledHtml,
  document,
  onOpenTestEmail,
}: HtmlExportDialogProps) {
  const [device, setDevice] = useState<"desktop" | "mobile-portrait" | "mobile-landscape">("desktop");
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "json">("preview");
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!open) return null;

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(compiledHtml);
      setCopiedHtml(true);
      toast.success("HTML copied to clipboard!");
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {
      toast.error("Failed to copy HTML");
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(document, null, 2));
      setCopiedJson(true);
      toast.success("Template JSON copied to clipboard!");
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      toast.error("Failed to copy JSON");
    }
  };

  const handleDownloadHtml = () => {
    const filename = `${document.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "email"}.html`;
    const blob = new Blob([compiledHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const handleDownloadJson = () => {
    const filename = `${document.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "template"}.json`;
    const blob = new Blob([JSON.stringify(document, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const getDeviceDimensions = () => {
    switch (device) {
      case "mobile-portrait":
        return { width: "375px", label: "375 × 667" };
      case "mobile-landscape":
        return { width: "667px", label: "667 × 375" };
      case "desktop":
      default:
        return {
          width: `${Math.max(document.settings.contentWidth || 600, 680)}px`,
          label: `${document.settings.contentWidth || 600}px Width`,
        };
    }
  };

  const dim = getDeviceDimensions();

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in-0 duration-200">
      {/* Top Header Bar matching RGE Studio Screenshot 1 */}
      <header className="h-14 border-b bg-card px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs">
        {/* Left: Close Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
            Close
          </Button>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <span className="text-xs font-medium text-muted-foreground hidden sm:inline truncate max-w-[200px]">
            Previewing: <strong className="text-foreground">{document.name}</strong>
          </span>
        </div>

        {/* Center: Light/Dark toggle, Device Selector, Dimension Badge */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <div className="flex items-center border rounded-md p-0.5 bg-muted/40">
            <Button
              variant={colorMode === "light" ? "secondary" : "ghost"}
              size="icon"
              className={`size-7 rounded-sm ${colorMode === "light" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"}`}
              onClick={() => setColorMode("light")}
              title="Light preview"
            >
              <Sun className="size-3.5" />
            </Button>
            <Button
              variant={colorMode === "dark" ? "secondary" : "ghost"}
              size="icon"
              className={`size-7 rounded-sm ${colorMode === "dark" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"}`}
              onClick={() => setColorMode("dark")}
              title="Dark client preview simulation"
            >
              <Moon className="size-3.5" />
            </Button>
          </div>

          {/* Device Selector */}
          <div className="flex items-center border rounded-md p-0.5 bg-muted/40">
            <Button
              variant={device === "desktop" ? "secondary" : "ghost"}
              size="icon"
              className={`size-7 rounded-sm ${device === "desktop" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"}`}
              onClick={() => setDevice("desktop")}
              title="Desktop View"
            >
              <Monitor className="size-3.5" />
            </Button>
            <Button
              variant={device === "mobile-portrait" ? "secondary" : "ghost"}
              size="icon"
              className={`size-7 rounded-sm ${device === "mobile-portrait" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"}`}
              onClick={() => setDevice("mobile-portrait")}
              title="Mobile Portrait (375px)"
            >
              <Smartphone className="size-3.5" />
            </Button>
            <Button
              variant={device === "mobile-landscape" ? "secondary" : "ghost"}
              size="icon"
              className={`size-7 rounded-sm ${device === "mobile-landscape" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"}`}
              onClick={() => setDevice("mobile-landscape")}
              title="Mobile Landscape (667px)"
            >
              <Tablet className="size-3.5 rotate-90" />
            </Button>
          </div>

          {/* Dimensions Indicator Pill */}
          <Badge
            variant="outline"
            className="hidden md:inline-flex text-[11px] font-mono font-medium px-2 py-1 text-muted-foreground bg-muted/20"
          >
            {dim.label}
          </Badge>

          {/* Mode Switcher: Preview vs Source Code */}
          <div className="flex items-center border rounded-md p-0.5 bg-muted/40 hidden sm:flex">
            <Button
              variant={activeTab === "preview" ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 px-2.5 text-xs ${activeTab === "preview" ? "bg-background shadow-xs font-semibold" : "text-muted-foreground"}`}
              onClick={() => setActiveTab("preview")}
            >
              <Eye className="size-3 mr-1" />
              Preview
            </Button>
            <Button
              variant={activeTab === "code" ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 px-2.5 text-xs ${activeTab === "code" ? "bg-background shadow-xs font-semibold" : "text-muted-foreground"}`}
              onClick={() => setActiveTab("code")}
            >
              <Code className="size-3 mr-1" />
              HTML
            </Button>
            <Button
              variant={activeTab === "json" ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 px-2.5 text-xs ${activeTab === "json" ? "bg-background shadow-xs font-semibold" : "text-muted-foreground"}`}
              onClick={() => setActiveTab("json")}
            >
              <FileJson className="size-3 mr-1" />
              JSON
            </Button>
          </div>
        </div>

        {/* Right: Actions & Send Test Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyHtml}
            className="h-8 gap-1.5 text-xs hidden md:inline-flex"
          >
            {copiedHtml ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
            Copy HTML
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadHtml}
            className="h-8 gap-1.5 text-xs hidden md:inline-flex"
          >
            <Download className="size-3.5" />
            Download .html
          </Button>

          {onOpenTestEmail && (
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onOpenTestEmail();
              }}
              className="h-8 bg-[#1C472A] text-white hover:bg-[#1C472A]/90 gap-1.5 text-xs font-medium px-3.5 shadow-2xs rounded-full"
            >
              <Send className="size-3.5 text-[#7ED957]" />
              Send test
            </Button>
          )}
        </div>
      </header>

      {/* Main Expansive Preview Area */}
      <main
        className={`flex-1 overflow-y-auto p-4 sm:p-8 flex items-start justify-center transition-colors duration-200 ${
          colorMode === "dark" ? "bg-[#121212]" : "bg-[#f4f4f7]"
        }`}
      >
        {activeTab === "preview" && (
          <div
            className="transition-all duration-300 w-full flex justify-center"
            style={{ maxWidth: "100%" }}
          >
            <div
              className={`transition-all duration-300 shadow-xl overflow-hidden rounded-xl border ${
                device === "desktop"
                  ? "w-full max-w-[900px] bg-white min-h-[780px]"
                  : device === "mobile-portrait"
                    ? "w-[375px] max-w-[375px] border-[6px] border-neutral-800 rounded-[32px] bg-white min-h-[667px]"
                    : "w-[667px] max-w-[667px] border-[6px] border-neutral-800 rounded-[28px] bg-white min-h-[375px]"
              }`}
            >
              <iframe
                srcDoc={compiledHtml}
                title="Full Responsive Email Preview"
                className="w-full h-full border-0 min-h-[760px]"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>
        )}

        {activeTab === "code" && (
          <div className="w-full max-w-4xl bg-[#1E1E1E] rounded-xl overflow-hidden shadow-xl border">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-[#333]">
              <span className="text-xs font-mono text-[#D4D4D4]">email.html (Production Table HTML)</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopyHtml} className="h-7 text-xs text-white hover:bg-white/10 gap-1">
                  {copiedHtml ? <Check className="size-3 text-green-400" /> : <Copy className="size-3" />}
                  Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownloadHtml} className="h-7 text-xs text-white hover:bg-white/10 gap-1">
                  <Download className="size-3" />
                  Download
                </Button>
              </div>
            </div>
            <pre className="p-5 text-xs font-mono text-[#D4D4D4] overflow-auto max-h-[75vh] leading-relaxed">
              <code>{compiledHtml}</code>
            </pre>
          </div>
        )}

        {activeTab === "json" && (
          <div className="w-full max-w-4xl bg-card rounded-xl overflow-hidden shadow-xl border">
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b">
              <span className="text-xs font-mono text-muted-foreground">template.json (Document Model)</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopyJson} className="h-7 text-xs gap-1">
                  {copiedJson ? <Check className="size-3 text-green-600" /> : <Copy className="size-3" />}
                  Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownloadJson} className="h-7 text-xs gap-1">
                  <Download className="size-3" />
                  Download
                </Button>
              </div>
            </div>
            <pre className="p-5 text-xs font-mono bg-muted/10 overflow-auto max-h-[75vh] leading-relaxed">
              <code>{JSON.stringify(document, null, 2)}</code>
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
