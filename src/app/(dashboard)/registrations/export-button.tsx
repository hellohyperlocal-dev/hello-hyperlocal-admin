"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ExportButton() {
  const [downloading, setDownloading] = useState(false);

  const handleExport = () => {
    setDownloading(true);
    toast.info("Preparing Excel export…");

    try {
      const downloadLink = document.createElement("a");
      downloadLink.href = "/api/export/registrations";
      downloadLink.download = `hello-linden-registrations-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setTimeout(() => {
        setDownloading(false);
        toast.success("Download started.");
      }, 1000);
    } catch (err) {
      console.error(err);
      setDownloading(false);
      toast.error("Failed to download.");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={downloading}>
      {downloading ? "Exporting…" : "Export to Excel"}
    </Button>
  );
}
