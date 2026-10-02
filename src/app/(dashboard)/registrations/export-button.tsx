"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  totalCount?: number;
}

export function ExportButton({ totalCount }: ExportButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleExport = () => {
    setDownloading(true);
    toast.info("Preparing Excel export sheet...");

    try {
      // Direct navigation triggers attachment download without unloading the page
      const downloadLink = document.createElement("a");
      downloadLink.href = "/api/export/registrations";
      downloadLink.download = `hello-linden-registrations-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setTimeout(() => {
        setDownloading(false);
        toast.success("Excel sheet download started.");
      }, 1000);
    } catch (err) {
      console.error(err);
      setDownloading(false);
      toast.error("Failed to start download. Please try again.");
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={downloading}
      className="gap-2 border-border shadow-xs hover:bg-accent"
      title="Export all registration sign-ups into an Excel-ready CSV sheet"
    >
      {downloading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
      )}
      <span>Export to Excel</span>
      {totalCount !== undefined && totalCount > 0 && (
        <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {totalCount}
        </span>
      )}
    </Button>
  );
}
