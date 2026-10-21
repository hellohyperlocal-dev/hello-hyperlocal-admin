"use client";

import {
  EmailDocument,
  EmailRow,
  EmailColumn,
  EmailBlock,
  BlockType,
} from "@/lib/email-designer/types";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Plus,
  MousePointerClick,
  Sparkles,
} from "lucide-react";

interface DesignerCanvasProps {
  document: EmailDocument;
  viewport: "desktop" | "mobile";
  selectedBlockId: string | null;
  onSelectBlock: (block: EmailBlock) => void;
  selectedRowId: string | null;
  onSelectRow: (row: EmailRow) => void;
  onMoveRow: (rowId: string, direction: "up" | "down") => void;
  onMoveBlock: (rowId: string, colId: string, blockId: string, direction: "up" | "down") => void;
  onDuplicateBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onDeleteRow: (rowId: string) => void;
  onAddBlockToCol: (rowId: string, colId: string, type: BlockType) => void;
}

function RenderCanvasBlock({
  block,
  defaultFont,
}: {
  block: EmailBlock;
  defaultFont: string;
}) {
  switch (block.type) {
    case "title": {
      const c = block.content as any;
      const Tag = c.level === "h2" ? "h2" : c.level === "h3" ? "h3" : "h1";
      return (
        <div
          style={{
            padding: `${c.paddingTop ?? 10}px ${c.paddingRight ?? 15}px ${c.paddingBottom ?? 10}px ${c.paddingLeft ?? 15}px`,
            textAlign: c.align || "left",
            fontFamily: defaultFont,
          }}
        >
          <Tag
            style={{
              fontSize: `${c.fontSize || 24}px`,
              lineHeight: c.lineHeight || 1.3,
              fontWeight: c.fontWeight || "bold",
              color: c.color || "#1C472A",
              margin: 0,
            }}
          >
            {c.text || "Headline"}
          </Tag>
        </div>
      );
    }

    case "paragraph": {
      const c = block.content as any;
      return (
        <div
          style={{
            padding: `${c.paddingTop ?? 8}px ${c.paddingRight ?? 15}px ${c.paddingBottom ?? 8}px ${c.paddingLeft ?? 15}px`,
            textAlign: c.align || "left",
            fontFamily: defaultFont,
          }}
        >
          <p
            style={{
              fontSize: `${c.fontSize || 15}px`,
              lineHeight: c.lineHeight || 1.6,
              fontWeight: c.fontWeight || "normal",
              color: c.color || "#374151",
              margin: 0,
              whiteSpace: "pre-line",
            }}
          >
            {c.text || "Write text here..."}
          </p>
        </div>
      );
    }

    case "list": {
      const c = block.content as any;
      const Tag = c.listType === "numbered" ? "ol" : "ul";
      return (
        <div
          style={{
            padding: `${c.paddingTop ?? 8}px ${c.paddingRight ?? 15}px ${c.paddingBottom ?? 8}px ${c.paddingLeft ?? 15}px`,
            fontFamily: defaultFont,
          }}
        >
          <Tag className={c.listType === "numbered" ? "list-decimal ml-6" : "list-disc ml-6"}>
            {(c.items || []).map((item: string, idx: number) => (
              <li
                key={idx}
                style={{
                  fontSize: `${c.fontSize || 14}px`,
                  color: c.color || "#374151",
                  marginBottom: "4px",
                }}
              >
                {item}
              </li>
            ))}
          </Tag>
        </div>
      );
    }

    case "image": {
      const c = block.content as any;
      if (!c.url) {
        return (
          <div
            style={{
              padding: `${c.paddingTop ?? 10}px ${c.paddingRight ?? 15}px ${c.paddingBottom ?? 10}px ${c.paddingLeft ?? 15}px`,
            }}
          >
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center text-xs text-muted-foreground bg-muted/20">
              Image placeholder — click to add or upload an image
            </div>
          </div>
        );
      }
      return (
        <div
          style={{
            padding: `${c.paddingTop ?? 10}px ${c.paddingRight ?? 15}px ${c.paddingBottom ?? 10}px ${c.paddingLeft ?? 15}px`,
            textAlign: c.align || "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.url}
            alt={c.alt || "Image"}
            style={{
              maxWidth: "100%",
              width: `${c.widthPercent || 100}%`,
              borderRadius: `${c.borderRadius || 0}px`,
              display: "inline-block",
            }}
          />
        </div>
      );
    }

    case "button": {
      const c = block.content as any;
      return (
        <div
          style={{
            padding: `${c.paddingTop ?? 12}px 15px ${c.paddingBottom ?? 12}px 15px`,
            textAlign: c.align || "center",
          }}
        >
          <button
            type="button"
            style={{
              backgroundColor: c.backgroundColor || "#1C472A",
              color: c.textColor || "#ffffff",
              borderRadius: `${c.borderRadius ?? 6}px`,
              padding: `${c.paddingVertical ?? 12}px ${c.paddingHorizontal ?? 24}px`,
              fontSize: `${c.fontSize || 15}px`,
              fontWeight: c.fontWeight || "600",
              width: c.fullWidth ? "100%" : "auto",
              fontFamily: defaultFont,
              display: "inline-block",
            }}
            className="shadow-2xs cursor-pointer border-none"
          >
            {c.text || "Click Here"}
          </button>
        </div>
      );
    }

    case "divider": {
      const c = block.content as any;
      return (
        <div
          style={{
            padding: `${c.paddingTop ?? 12}px 15px ${c.paddingBottom ?? 12}px 15px`,
            textAlign: c.align || "center",
          }}
        >
          <hr
            style={{
              borderTop: `${c.height || 1}px ${c.style || "solid"} ${c.color || "#e5e7eb"}`,
              borderBottom: "none",
              borderLeft: "none",
              borderRight: "none",
              width: `${c.widthPercent || 100}%`,
              display: "inline-block",
              margin: 0,
            }}
          />
        </div>
      );
    }

    case "spacer": {
      const c = block.content as any;
      return <div style={{ height: `${c.height || 24}px` }} className="w-full" />;
    }

    case "social":
    case "icons": {
      const c = block.content as any;
      const networks = c.networks || [];
      const iconSize = c.iconSize || 24;
      const spacing = c.spacing || 12;

      const networkIcons: Record<string, { bg: string; text: string }> = {
        facebook: { bg: "#1877F2", text: "f" },
        instagram: { bg: "#E4405F", text: "ig" },
        x: { bg: "#000000", text: "X" },
        whatsapp: { bg: "#25D366", text: "wa" },
        website: { bg: "#1C472A", text: "web" },
        linkedin: { bg: "#0A66C2", text: "in" },
      };

      return (
        <div
          style={{
            padding: `${c.paddingTop ?? 10}px 15px ${c.paddingBottom ?? 10}px 15px`,
            textAlign: c.align || "center",
          }}
        >
          <div className="inline-flex items-center" style={{ gap: `${spacing}px` }}>
            {networks.map((net: any, idx: number) => {
              const info = networkIcons[net.network] || { bg: "#1C472A", text: "•" };
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: info.bg,
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                    fontSize: `${Math.round(iconSize * 0.45)}px`,
                  }}
                  className="rounded-full text-white font-bold flex items-center justify-center shrink-0 shadow-2xs"
                >
                  {info.text}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case "html": {
      const c = block.content as any;
      return (
        <div
          style={{
            padding: `${c.paddingTop ?? 10}px 15px ${c.paddingBottom ?? 10}px 15px`,
            fontFamily: defaultFont,
          }}
          dangerouslySetInnerHTML={{ __html: c.code || "" }}
        />
      );
    }

    case "video": {
      const c = block.content as any;
      return (
        <div
          style={{
            padding: `${c.paddingTop ?? 10}px 15px ${c.paddingBottom ?? 10}px 15px`,
            textAlign: c.align || "center",
          }}
        >
          <div className="bg-[#1a1a1a] rounded-lg p-8 text-center text-white inline-block w-full max-w-md shadow-2xs">
            <div className="size-12 rounded-full bg-white text-[#1C472A] flex items-center justify-center mx-auto mb-2 text-xl font-bold">
              ▶
            </div>
            <p className="text-sm font-semibold">{c.title || "Watch Video"}</p>
          </div>
        </div>
      );
    }

    case "menu": {
      const c = block.content as any;
      return (
        <div
          style={{
            padding: `${c.paddingTop ?? 12}px 15px ${c.paddingBottom ?? 12}px 15px`,
            textAlign: c.align || "center",
            fontFamily: defaultFont,
          }}
        >
          <div className="inline-flex flex-wrap gap-4 items-center justify-center">
            {(c.items || []).map((item: any, idx: number) => (
              <span
                key={idx}
                style={{ fontSize: `${c.fontSize || 13}px`, color: c.color || "#1C472A" }}
                className="font-medium hover:underline cursor-pointer"
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      );
    }

    case "table": {
      const c = block.content as any;
      const rows = c.rows || [];
      return (
        <div
          style={{
            padding: `${c.paddingTop ?? 10}px 15px ${c.paddingBottom ?? 10}px 15px`,
            fontFamily: defaultFont,
          }}
        >
          <table className="w-full border-collapse" style={{ borderColor: c.borderColor || "#e5e7eb" }}>
            <tbody>
              {rows.map((row: string[], rIdx: number) => {
                const isHeader = rIdx === 0 && c.hasHeader;
                return (
                  <tr key={rIdx} className={isHeader ? "bg-muted/60 font-semibold" : ""}>
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="p-2 border text-xs"
                        style={{
                          borderColor: c.borderColor || "#e5e7eb",
                          color: c.textColor || "#374151",
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    default:
      return null;
  }
}

export function DesignerCanvas({
  document,
  viewport,
  selectedBlockId,
  onSelectBlock,
  selectedRowId,
  onSelectRow,
  onMoveRow,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onDeleteRow,
  onAddBlockToCol,
}: DesignerCanvasProps) {
  const settings = document.settings;
  const isMobile = viewport === "mobile";
  const canvasWidth = isMobile ? 375 : settings.contentWidth || 600;

  return (
    <main
      className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-start min-h-0 transition-colors"
      style={{ backgroundColor: settings.backgroundColor || "#f4f4f7" }}
      onClick={() => {
        // click outside blocks to deselect
      }}
    >
      {/* Mobile Frame Container (when in mobile view) */}
      <div
        className={`transition-all duration-300 relative ${
          isMobile
            ? "border-[8px] border-neutral-800 rounded-[36px] shadow-2xl overflow-hidden bg-background my-2"
            : "w-full flex flex-col items-center"
        }`}
        style={{
          width: isMobile ? "375px" : "100%",
          maxWidth: isMobile ? "375px" : "100%",
        }}
      >
        {/* Mobile Status Bar Simulation */}
        {isMobile && (
          <div className="h-6 bg-neutral-800 text-white text-[10px] px-6 flex items-center justify-between font-mono shrink-0 select-none">
            <span>09:41</span>
            <div className="w-16 h-3 bg-neutral-900 rounded-full mx-auto" />
            <span>5G 100%</span>
          </div>
        )}

        {/* Email Content Container */}
        <div
          className="shadow-sm transition-all duration-200"
          style={{
            width: isMobile ? "100%" : `${canvasWidth}px`,
            maxWidth: "100%",
            backgroundColor: settings.contentBackgroundColor || "#ffffff",
            marginLeft: !isMobile && settings.contentAlign === "left" ? "0" : "auto",
            marginRight: !isMobile && settings.contentAlign === "left" ? "auto" : "auto",
          }}
        >
          {document.rows.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-primary/30 rounded-lg m-4 bg-primary/5">
              <Sparkles className="size-8 text-[#1C472A] mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-foreground">Canvas is Empty</h4>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Choose a row layout from the ROWS tab on the right to start designing your email.
              </p>
            </div>
          ) : (
            document.rows.map((row, rIdx) => {
              const isRowSelected = selectedRowId === row.id;

              return (
                <div
                  key={row.id || `row-${rIdx}`}
                  className={`relative group/row transition-all ${
                    isRowSelected ? "ring-2 ring-[#1C472A] z-10" : "hover:ring-1 hover:ring-[#1C472A]/40"
                  }`}
                  style={{
                    backgroundColor: row.settings?.backgroundColor || "transparent",
                    paddingTop: `${row.settings?.paddingTop || 0}px`,
                    paddingBottom: `${row.settings?.paddingBottom || 0}px`,
                    paddingLeft: `${row.settings?.paddingLeft || 0}px`,
                    paddingRight: `${row.settings?.paddingRight || 0}px`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRow(row);
                  }}
                >
                  {/* Floating Row Action Toolbar (Visible on Row Hover/Select) */}
                  <div
                    className={`absolute -top-3 right-3 items-center gap-0.5 bg-[#1C472A] text-white rounded-md px-1 py-0.5 shadow-md z-30 text-[11px] font-medium transition-opacity ${
                      isRowSelected ? "flex" : "hidden group-hover/row:flex"
                    }`}
                  >
                    <span className="px-1 text-[10px] uppercase font-bold text-[#7ED957]">Row</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-5 hover:bg-white/20 text-white rounded-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveRow(row.id, "up");
                      }}
                      disabled={rIdx === 0}
                      title="Move Row Up"
                    >
                      <ArrowUp className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-5 hover:bg-white/20 text-white rounded-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveRow(row.id, "down");
                      }}
                      disabled={rIdx === document.rows.length - 1}
                      title="Move Row Down"
                    >
                      <ArrowDown className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-5 hover:bg-destructive text-white rounded-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRow(row.id);
                      }}
                      title="Delete Row"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>

                  {/* Columns Flex/Grid Wrapper */}
                  <div
                    className={`w-full ${
                      isMobile
                        ? "flex flex-col"
                        : "flex flex-row items-stretch"
                    }`}
                    style={{
                      backgroundColor: row.settings?.contentBackgroundColor || "transparent",
                    }}
                  >
                    {row.columns.map((col, cIdx) => (
                      <div
                        key={col.id || `col-${cIdx}`}
                        style={{
                          width: isMobile ? "100%" : `${col.widthPercent}%`,
                          backgroundColor: col.settings?.backgroundColor || "transparent",
                          paddingTop: `${col.settings?.paddingTop || 0}px`,
                          paddingBottom: `${col.settings?.paddingBottom || 0}px`,
                          paddingLeft: `${col.settings?.paddingLeft || 0}px`,
                          paddingRight: `${col.settings?.paddingRight || 0}px`,
                        }}
                        className="relative min-h-[48px] flex flex-col justify-start"
                      >
                        {col.blocks.length === 0 ? (
                          /* Empty Drop Zone matching RGE Studio screenshot */
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddBlockToCol(row.id, col.id, "title");
                            }}
                            className="m-2 p-6 rounded-lg border-2 border-dashed border-[#1C472A]/30 bg-primary/5 hover:bg-primary/10 hover:border-[#1C472A] transition-all text-center flex flex-col items-center justify-center cursor-pointer group/drop"
                          >
                            <div className="size-7 rounded-full bg-[#1C472A] text-white flex items-center justify-center mb-1 shadow-2xs group-hover/drop:scale-110 transition-transform">
                              <Plus className="size-4" />
                            </div>
                            <span className="text-xs font-semibold text-[#1C472A]">
                              Drop content blocks here
                            </span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              or click to add Headline
                            </span>
                          </div>
                        ) : (
                          col.blocks.map((block, bIdx) => {
                            const isBlockSelected = selectedBlockId === block.id;

                            return (
                              <div
                                key={block.id || `block-${bIdx}`}
                                className={`relative group/block transition-all cursor-pointer ${
                                  isBlockSelected
                                    ? "ring-2 ring-[#7ED957] bg-primary/5 z-20"
                                    : "hover:ring-1 hover:ring-[#7ED957]/60"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectBlock(block);
                                }}
                              >
                                {/* Floating Block Action Toolbar (on Block Hover/Select) */}
                                <div
                                  className={`absolute -top-3 left-3 items-center gap-0.5 bg-[#0E0F0C] text-white rounded-md px-1 py-0.5 shadow-lg z-30 text-[11px] font-medium transition-opacity ${
                                    isBlockSelected ? "flex" : "hidden group-hover/block:flex"
                                  }`}
                                >
                                  <span className="px-1 text-[9px] uppercase font-bold text-[#7ED957]">
                                    {block.type}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-5 hover:bg-white/20 text-white rounded-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onMoveBlock(row.id, col.id, block.id, "up");
                                    }}
                                    disabled={bIdx === 0}
                                    title="Move Block Up"
                                  >
                                    <ArrowUp className="size-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-5 hover:bg-white/20 text-white rounded-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onMoveBlock(row.id, col.id, block.id, "down");
                                    }}
                                    disabled={bIdx === col.blocks.length - 1}
                                    title="Move Block Down"
                                  >
                                    <ArrowDown className="size-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-5 hover:bg-white/20 text-white rounded-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDuplicateBlock(block.id);
                                    }}
                                    title="Duplicate Block"
                                  >
                                    <Copy className="size-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-5 hover:bg-destructive text-white rounded-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteBlock(block.id);
                                    }}
                                    title="Delete Block"
                                  >
                                    <Trash2 className="size-3" />
                                  </Button>
                                </div>

                                <RenderCanvasBlock
                                  block={block}
                                  defaultFont={settings.defaultFont || "Arial, sans-serif"}
                                />
                              </div>
                            );
                          })
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
