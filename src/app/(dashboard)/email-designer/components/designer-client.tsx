"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  EmailDocument,
  EmailRow,
  EmailBlock,
  BlockType,
  RowLayout,
  EmailDesignSettings,
} from "@/lib/email-designer/types";
import {
  createDefaultBlock,
  createDefaultRow,
  generateId,
} from "@/lib/email-designer/presets";
import { compileEmailDocumentToHtml } from "@/lib/email-designer/compiler";
import { saveDesignerTemplateAction } from "@/lib/email-designer/actions";
import { DesignerHeader } from "./designer-header";
import { DesignerSidebar } from "./designer-sidebar";
import { DesignerCanvas } from "./designer-canvas";
import { TestEmailDialog } from "./test-email-dialog";
import { HtmlExportDialog } from "./html-export-dialog";
import { toast } from "sonner";

interface DesignerClientProps {
  initialDocument: EmailDocument;
}

export function DesignerClient({ initialDocument }: DesignerClientProps) {
  const [doc, setDoc] = useState<EmailDocument>(initialDocument);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "unsaved">("idle");
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Undo / Redo History Stacks
  const historyRef = useRef<{ past: EmailDocument[]; future: EmailDocument[] }>({
    past: [],
    future: [],
  });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Auto-save timer ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateDocWithHistory = useCallback((updater: (prev: EmailDocument) => EmailDocument) => {
    setDoc((prev) => {
      const next = updater(prev);
      if (next === prev) return prev;

      // Push to past history
      historyRef.current.past.push(prev);
      if (historyRef.current.past.length > 30) {
        historyRef.current.past.shift();
      }
      historyRef.current.future = [];
      setCanUndo(true);
      setCanRedo(false);
      setSaveStatus("unsaved");

      return next;
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (historyRef.current.past.length === 0) return;
    const previous = historyRef.current.past.pop()!;
    historyRef.current.future.push(doc);
    setDoc(previous);
    setCanUndo(historyRef.current.past.length > 0);
    setCanRedo(true);
    setSaveStatus("unsaved");
  }, [doc]);

  const handleRedo = useCallback(() => {
    if (historyRef.current.future.length === 0) return;
    const next = historyRef.current.future.pop()!;
    historyRef.current.past.push(doc);
    setDoc(next);
    setCanUndo(true);
    setCanRedo(historyRef.current.future.length > 0);
    setSaveStatus("unsaved");
  }, [doc]);

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.metaKey || e.ctrlKey) && e.key === "y") ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z")
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Save handler
  const handleSave = useCallback(async (isManual = false) => {
    setSaveStatus("saving");
    try {
      const res = await saveDesignerTemplateAction(doc);
      if (res.success) {
        setSaveStatus("saved");
        if (isManual) {
          toast.success("Template saved successfully!");
        }
      } else {
        setSaveStatus("unsaved");
        toast.error(res.error || "Failed to save template");
      }
    } catch {
      setSaveStatus("unsaved");
      if (isManual) {
        toast.error("Failed to save template");
      }
    }
  }, [doc]);

  // Auto-save debounce (after 2 seconds of inactivity)
  useEffect(() => {
    if (saveStatus !== "unsaved") return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(false);
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [doc, saveStatus, handleSave]);

  // Selected Block Lookup
  const selectedBlock: EmailBlock | null = (() => {
    if (!selectedBlockId) return null;
    for (const row of doc.rows) {
      for (const col of row.columns) {
        const found = col.blocks.find((b) => b.id === selectedBlockId);
        if (found) return found;
      }
    }
    return null;
  })();

  // Selected Row Lookup
  const selectedRow: EmailRow | null = (() => {
    if (!selectedRowId) return null;
    return doc.rows.find((r) => r.id === selectedRowId) || null;
  })();

  // Handlers for modifying elements
  const handleTitleChange = (newTitle: string) => {
    updateDocWithHistory((prev) => ({ ...prev, name: newTitle }));
  };

  const handleUpdateSettings = (settings: EmailDesignSettings) => {
    updateDocWithHistory((prev) => ({ ...prev, settings }));
  };

  const handleUpdateMetadata = (meta: { subject: string; preheader: string }) => {
    updateDocWithHistory((prev) => ({ ...prev, subject: meta.subject, preheader: meta.preheader }));
  };

  const handleAddRow = (layout: RowLayout) => {
    const newRow = createDefaultRow(layout);
    updateDocWithHistory((prev) => ({
      ...prev,
      rows: [...prev.rows, newRow],
    }));
    setSelectedRowId(newRow.id);
    setSelectedBlockId(null);
    toast.success(`Added ${layout} row`);
  };

  const handleDeleteRow = (rowId: string) => {
    updateDocWithHistory((prev) => ({
      ...prev,
      rows: prev.rows.filter((r) => r.id !== rowId),
    }));
    if (selectedRowId === rowId) setSelectedRowId(null);
  };

  const handleMoveRow = (rowId: string, direction: "up" | "down") => {
    updateDocWithHistory((prev) => {
      const idx = prev.rows.findIndex((r) => r.id === rowId);
      if (idx < 0) return prev;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.rows.length) return prev;

      const nextRows = [...prev.rows];
      const moved = nextRows[idx];
      const other = nextRows[targetIdx];
      nextRows[idx] = other;
      nextRows[targetIdx] = moved;
      return { ...prev, rows: nextRows };
    });
  };

  const handleAddBlock = (type: BlockType) => {
    const newBlock = createDefaultBlock(type);
    updateDocWithHistory((prev) => {
      // If there are no rows, add a fresh default row with the new block
      if (!prev.rows || prev.rows.length === 0) {
        const freshRow = createDefaultRow("1-col");
        freshRow.columns[0].blocks = [newBlock];
        return {
          ...prev,
          rows: [freshRow],
        };
      }

      let placed = false;

      // 1. If a block is currently selected, insert immediately after that block
      if (selectedBlockId) {
        const nextRows = prev.rows.map((row) => ({
          ...row,
          columns: row.columns.map((col) => {
            const bIdx = col.blocks.findIndex((b) => b.id === selectedBlockId);
            if (bIdx >= 0) {
              placed = true;
              return {
                ...col,
                blocks: [
                  ...col.blocks.slice(0, bIdx + 1),
                  newBlock,
                  ...col.blocks.slice(bIdx + 1),
                ],
              };
            }
            return col;
          }),
        }));

        if (placed) return { ...prev, rows: nextRows };
      }

      // 2. If a row is selected, append to its first column
      if (selectedRowId) {
        const nextRows = prev.rows.map((row) => {
          if (row.id === selectedRowId && row.columns.length > 0) {
            placed = true;
            return {
              ...row,
              columns: row.columns.map((col, cIdx) =>
                cIdx === 0
                  ? { ...col, blocks: [...col.blocks, newBlock] }
                  : col
              ),
            };
          }
          return row;
        });

        if (placed) return { ...prev, rows: nextRows };
      }

      // 3. Fallback: append to the first column of the last row
      const lastIdx = prev.rows.length - 1;
      const nextRows = prev.rows.map((row, rIdx) => {
        if (rIdx === lastIdx && row.columns.length > 0) {
          return {
            ...row,
            columns: row.columns.map((col, cIdx) =>
              cIdx === 0
                ? { ...col, blocks: [...col.blocks, newBlock] }
                : col
            ),
          };
        }
        return row;
      });

      return { ...prev, rows: nextRows };
    });

    setSelectedBlockId(newBlock.id);
    setSelectedRowId(null);
  };

  const handleAddBlockToCol = (rowId: string, colId: string, type: BlockType) => {
    const newBlock = createDefaultBlock(type);
    updateDocWithHistory((prev) => {
      const nextRows = prev.rows.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          columns: row.columns.map((col) => {
            if (col.id !== colId) return col;
            return {
              ...col,
              blocks: [...col.blocks, newBlock],
            };
          }),
        };
      });
      return { ...prev, rows: nextRows };
    });
    setSelectedBlockId(newBlock.id);
    setSelectedRowId(null);
  };

  const handleUpdateBlock = (updatedBlock: EmailBlock) => {
    updateDocWithHistory((prev) => {
      const nextRows = prev.rows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => ({
          ...col,
          blocks: col.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)),
        })),
      }));
      return { ...prev, rows: nextRows };
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    updateDocWithHistory((prev) => {
      const nextRows = prev.rows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => ({
          ...col,
          blocks: col.blocks.filter((b) => b.id !== blockId),
        })),
      }));
      return { ...prev, rows: nextRows };
    });
    if (selectedBlockId === blockId) setSelectedBlockId(null);
  };

  const handleDuplicateBlock = (blockId: string) => {
    const newId = `${generateId("block")}`;
    updateDocWithHistory((prev) => {
      let placed = false;
      const nextRows = prev.rows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => {
          const idx = col.blocks.findIndex((b) => b.id === blockId);
          if (idx < 0) return col;
          placed = true;
          const original = col.blocks[idx];
          const clone: EmailBlock = {
            ...original,
            id: newId,
            content: JSON.parse(JSON.stringify(original.content)),
          };
          return {
            ...col,
            blocks: [
              ...col.blocks.slice(0, idx + 1),
              clone,
              ...col.blocks.slice(idx + 1),
            ],
          };
        }),
      }));
      return placed ? { ...prev, rows: nextRows } : prev;
    });
    setSelectedBlockId(newId);
  };

  const handleMoveBlock = (
    rowId: string,
    colId: string,
    blockId: string,
    direction: "up" | "down"
  ) => {
    updateDocWithHistory((prev) => {
      const nextRows = prev.rows.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          columns: row.columns.map((col) => {
            if (col.id !== colId) return col;
            const idx = col.blocks.findIndex((b) => b.id === blockId);
            if (idx < 0) return col;
            const targetIdx = direction === "up" ? idx - 1 : idx + 1;
            if (targetIdx < 0 || targetIdx >= col.blocks.length) return col;

            const nextBlocks = [...col.blocks];
            const moved = nextBlocks[idx];
            const other = nextBlocks[targetIdx];
            nextBlocks[idx] = other;
            nextBlocks[targetIdx] = moved;
            return { ...col, blocks: nextBlocks };
          }),
        };
      });
      return { ...prev, rows: nextRows };
    });
  };

  const handleUpdateRow = (updatedRow: EmailRow) => {
    updateDocWithHistory((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => (r.id === updatedRow.id ? updatedRow : r)),
    }));
  };

  // Pre-compiled HTML for export and testing
  const compiledHtml = compileEmailDocumentToHtml(doc);

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(compiledHtml);
      toast.success("Compiled HTML copied to clipboard!");
    } catch {
      toast.error("Failed to copy HTML");
    }
  };

  const handleDownloadHtml = () => {
    const filename = `${doc.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "email"}.html`;
    const blob = new Blob([compiledHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 overflow-hidden bg-background">
      {/* RGE Studio Top Navigation Bar */}
      <DesignerHeader
        documentId={doc.id}
        title={doc.name}
        onTitleChange={handleTitleChange}
        viewport={viewport}
        onViewportChange={setViewport}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={() => handleSave(true)}
        saveStatus={saveStatus}
        onOpenTestEmail={() => setTestEmailOpen(true)}
        onOpenExportDialog={() => setExportDialogOpen(true)}
        onCopyHtml={handleCopyHtml}
        onDownloadHtml={handleDownloadHtml}
      />

      {/* Main Workspace: Center Canvas + Right RGE Sidebar */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <DesignerCanvas
          document={doc}
          viewport={viewport}
          selectedBlockId={selectedBlockId}
          onSelectBlock={(b) => {
            setSelectedBlockId(b.id);
            setSelectedRowId(null);
          }}
          selectedRowId={selectedRowId}
          onSelectRow={(r) => {
            setSelectedRowId(r.id);
            setSelectedBlockId(null);
          }}
          onMoveRow={handleMoveRow}
          onMoveBlock={handleMoveBlock}
          onDuplicateBlock={handleDuplicateBlock}
          onDeleteBlock={handleDeleteBlock}
          onDeleteRow={handleDeleteRow}
          onAddBlockToCol={handleAddBlockToCol}
        />

        <DesignerSidebar
          settings={doc.settings}
          onUpdateSettings={handleUpdateSettings}
          metadata={{ subject: doc.subject, preheader: doc.preheader }}
          onUpdateMetadata={handleUpdateMetadata}
          onAddBlock={handleAddBlock}
          onAddRow={handleAddRow}
          selectedBlock={selectedBlock}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          onDuplicateBlock={handleDuplicateBlock}
          selectedRow={selectedRow}
          onUpdateRow={handleUpdateRow}
          onDeleteRow={handleDeleteRow}
          onDeselect={() => {
            setSelectedBlockId(null);
            setSelectedRowId(null);
          }}
        />
      </div>

      {/* Test Email Delivery Modal */}
      <TestEmailDialog
        open={testEmailOpen}
        onOpenChange={setTestEmailOpen}
        subject={doc.subject}
        compiledHtml={compiledHtml}
      />

      {/* HTML Code & Preview Export Modal */}
      <HtmlExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        compiledHtml={compiledHtml}
        document={doc}
        onOpenTestEmail={() => setTestEmailOpen(true)}
      />
    </div>
  );
}
