"use client";

import { useState } from "react";
import {
  EmailBlock,
  EmailRow,
  BlockType,
  RowLayout,
  EmailDesignSettings,
} from "@/lib/email-designer/types";
import { BlockInspector } from "./block-inspectors";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Heading,
  AlignLeft,
  List,
  Image as ImageIcon,
  SquareMousePointer,
  Minus,
  MoveVertical,
  Share2,
  Code2,
  Video,
  Menu as MenuIcon,
  Table as TableIcon,
  ChevronLeft,
  Trash2,
  Copy,
  Layers,
  Settings,
  LayoutGrid,
  Columns,
  Sparkles,
} from "lucide-react";

interface DesignerSidebarProps {
  settings: EmailDesignSettings;
  onUpdateSettings: (settings: EmailDesignSettings) => void;
  metadata: { subject: string; preheader: string };
  onUpdateMetadata: (metadata: { subject: string; preheader: string }) => void;
  onAddBlock: (type: BlockType) => void;
  onAddRow: (layout: RowLayout) => void;
  selectedBlock: EmailBlock | null;
  onUpdateBlock: (block: EmailBlock) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  selectedRow: EmailRow | null;
  onUpdateRow: (row: EmailRow) => void;
  onDeleteRow: (rowId: string) => void;
  onDeselect: () => void;
}

const CONTENT_BLOCKS: { type: BlockType; label: string; icon: any }[] = [
  { type: "title", label: "Title", icon: Heading },
  { type: "paragraph", label: "Paragraph", icon: AlignLeft },
  { type: "list", label: "List", icon: List },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "button", label: "Button", icon: SquareMousePointer },
  { type: "table", label: "Table", icon: TableIcon },
  { type: "divider", label: "Divider", icon: Minus },
  { type: "spacer", label: "Spacer", icon: MoveVertical },
  { type: "social", label: "Social", icon: Share2 },
  { type: "html", label: "HTML", icon: Code2 },
  { type: "video", label: "Video", icon: Video },
  { type: "icons", label: "Icons", icon: Sparkles },
  { type: "menu", label: "Menu", icon: MenuIcon },
];

const ROW_PRESETS: { layout: RowLayout; label: string; cols: number[] }[] = [
  { layout: "1-col", label: "1 Column (100%)", cols: [100] },
  { layout: "2-col-equal", label: "2 Columns (50% / 50%)", cols: [50, 50] },
  { layout: "2-col-33-67", label: "2 Columns (33% / 67%)", cols: [33, 67] },
  { layout: "2-col-67-33", label: "2 Columns (67% / 33%)", cols: [67, 33] },
  { layout: "2-col-25-75", label: "2 Columns (25% / 75%)", cols: [25, 75] },
  { layout: "2-col-75-25", label: "2 Columns (75% / 25%)", cols: [75, 25] },
  { layout: "3-col-equal", label: "3 Columns (Equal)", cols: [33, 34, 33] },
  { layout: "4-col-equal", label: "4 Columns (Equal)", cols: [25, 25, 25, 25] },
];

export function DesignerSidebar({
  settings,
  onUpdateSettings,
  metadata,
  onUpdateMetadata,
  onAddBlock,
  onAddRow,
  selectedBlock,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  selectedRow,
  onUpdateRow,
  onDeleteRow,
  onDeselect,
}: DesignerSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>("content");

  // If a block is currently selected, show contextual inspector
  if (selectedBlock) {
    return (
      <aside className="w-80 border-l bg-card flex flex-col shrink-0 h-[calc(100vh-3.5rem)] overflow-hidden z-10 shadow-sm">
        <div className="h-12 border-b px-3 flex items-center justify-between bg-muted/30 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselect}
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground -ml-1"
          >
            <ChevronLeft className="size-3.5" />
            Back to blocks
          </Button>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => onDuplicateBlock(selectedBlock.id)}
              title="Duplicate block"
            >
              <Copy className="size-3.5 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 hover:text-destructive"
              onClick={() => onDeleteBlock(selectedBlock.id)}
              title="Delete block"
            >
              <Trash2 className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="p-4 border-b bg-muted/10 shrink-0 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
              Block Inspector
            </span>
            <h3 className="text-sm font-bold capitalize text-foreground">
              {selectedBlock.type} Block
            </h3>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <BlockInspector block={selectedBlock} onChange={onUpdateBlock} />
        </div>
      </aside>
    );
  }

  // If a row is currently selected, show row inspector
  if (selectedRow) {
    return (
      <aside className="w-80 border-l bg-card flex flex-col shrink-0 h-[calc(100vh-3.5rem)] overflow-hidden z-10 shadow-sm">
        <div className="h-12 border-b px-3 flex items-center justify-between bg-muted/30 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselect}
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground -ml-1"
          >
            <ChevronLeft className="size-3.5" />
            Back to overview
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-7 hover:text-destructive"
            onClick={() => onDeleteRow(selectedRow.id)}
            title="Delete row"
          >
            <Trash2 className="size-3.5 text-muted-foreground" />
          </Button>
        </div>

        <div className="p-4 border-b bg-muted/10 shrink-0">
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
            Row Inspector
          </span>
          <h3 className="text-sm font-bold capitalize text-foreground">
            {selectedRow.layout} Layout
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Row Background (Full Width)</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedRow.settings?.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  onUpdateRow({
                    ...selectedRow,
                    settings: {
                      ...selectedRow.settings,
                      backgroundColor: e.target.value,
                    },
                  })
                }
                className="size-7 rounded border cursor-pointer"
              />
              <Input
                value={selectedRow.settings?.backgroundColor || ""}
                placeholder="transparent or #hex"
                onChange={(e) =>
                  onUpdateRow({
                    ...selectedRow,
                    settings: {
                      ...selectedRow.settings,
                      backgroundColor: e.target.value,
                    },
                  })
                }
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Content Area Background</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedRow.settings?.contentBackgroundColor || "#ffffff"}
                onChange={(e) =>
                  onUpdateRow({
                    ...selectedRow,
                    settings: {
                      ...selectedRow.settings,
                      contentBackgroundColor: e.target.value,
                    },
                  })
                }
                className="size-7 rounded border cursor-pointer"
              />
              <Input
                value={selectedRow.settings?.contentBackgroundColor || ""}
                placeholder="#ffffff"
                onChange={(e) =>
                  onUpdateRow({
                    ...selectedRow,
                    settings: {
                      ...selectedRow.settings,
                      contentBackgroundColor: e.target.value,
                    },
                  })
                }
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Row Padding</Label>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Top</span>
                <span className="text-muted-foreground">{selectedRow.settings?.paddingTop || 0}px</span>
              </div>
              <Slider
                min={0}
                max={60}
                value={[selectedRow.settings?.paddingTop || 0]}
                onValueChange={([val]) =>
                  onUpdateRow({
                    ...selectedRow,
                    settings: { ...selectedRow.settings, paddingTop: val },
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Bottom</span>
                <span className="text-muted-foreground">{selectedRow.settings?.paddingBottom || 0}px</span>
              </div>
              <Slider
                min={0}
                max={60}
                value={[selectedRow.settings?.paddingBottom || 0]}
                onValueChange={([val]) =>
                  onUpdateRow({
                    ...selectedRow,
                    settings: { ...selectedRow.settings, paddingBottom: val },
                  })
                }
              />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Default: RGE Studio 3-tab layout: CONTENT | ROWS | SETTINGS
  return (
    <aside className="w-80 border-l bg-card flex flex-col shrink-0 h-[calc(100vh-3.5rem)] overflow-hidden z-10 shadow-sm">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="h-12 border-b px-2 flex items-center bg-muted/20 shrink-0">
          <TabsList className="w-full grid grid-cols-3 h-8 p-0.5 bg-muted/60">
            <TabsTrigger value="content" className="text-[11px] font-bold tracking-wider uppercase gap-1">
              <LayoutGrid className="size-3" />
              Content
            </TabsTrigger>
            <TabsTrigger value="rows" className="text-[11px] font-bold tracking-wider uppercase gap-1">
              <Columns className="size-3" />
              Rows
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-[11px] font-bold tracking-wider uppercase gap-1">
              <Settings className="size-3" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: CONTENT BLOCKS */}
        <TabsContent value="content" className="flex-1 overflow-y-auto p-3 m-0">
          <div className="grid grid-cols-3 gap-2">
            {CONTENT_BLOCKS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => onAddBlock(item.type)}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/50 transition-all text-center group cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <div className="size-8 rounded-md bg-muted/60 flex items-center justify-center mb-1.5 group-hover:bg-[#1C472A] group-hover:text-white transition-colors text-muted-foreground">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground/80 group-hover:text-[#1C472A]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 p-3 rounded-md bg-muted/30 border border-dashed text-center">
            <p className="text-xs text-muted-foreground">
              Click any block to append it to your active email column.
            </p>
          </div>
        </TabsContent>

        {/* TAB 2: ROW LAYOUTS */}
        <TabsContent value="rows" className="flex-1 overflow-y-auto p-3 m-0 space-y-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-foreground">Empty Row Layouts</span>
            <p className="text-[11px] text-muted-foreground">Choose a column structure to add to the canvas.</p>
          </div>

          <div className="space-y-2">
            {ROW_PRESETS.map((preset) => (
              <button
                key={preset.layout}
                type="button"
                onClick={() => onAddRow(preset.layout)}
                className="w-full p-2.5 rounded-lg border bg-card hover:border-[#1C472A] hover:bg-primary/5 transition-all text-left group cursor-pointer shadow-2xs"
              >
                <div className="flex h-7 gap-1.5 mb-1.5">
                  {preset.cols.map((colWidth, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${colWidth}%` }}
                      className="h-full bg-muted-foreground/20 group-hover:bg-[#1C472A]/40 rounded transition-colors flex items-center justify-center text-[9px] font-mono text-muted-foreground group-hover:text-foreground"
                    >
                      {colWidth}%
                    </div>
                  ))}
                </div>
                <span className="text-xs font-medium text-foreground group-hover:text-[#1C472A]">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: DESIGN SETTINGS */}
        <TabsContent value="settings" className="flex-1 overflow-y-auto p-4 m-0 space-y-5">
          <div className="space-y-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Design Settings
            </span>

            {/* Content Area Width */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <Label className="text-xs font-semibold">Content Area Width</Label>
                <span className="text-muted-foreground font-mono">{settings.contentWidth}px</span>
              </div>
              <Slider
                min={480}
                max={800}
                step={10}
                value={[settings.contentWidth]}
                onValueChange={([val]) => onUpdateSettings({ ...settings, contentWidth: val })}
              />
            </div>

            {/* Content Area Alignment */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Content Area Alignment</Label>
              <div className="flex rounded-md border p-0.5 bg-muted/30">
                <Button
                  type="button"
                  variant={settings.contentAlign === "left" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onUpdateSettings({ ...settings, contentAlign: "left" })}
                  className="flex-1 h-7 text-xs"
                >
                  LEFT
                </Button>
                <Button
                  type="button"
                  variant={settings.contentAlign === "center" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onUpdateSettings({ ...settings, contentAlign: "center" })}
                  className="flex-1 h-7 text-xs"
                >
                  CENTER
                </Button>
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Page Background Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.backgroundColor || "#f4f4f7"}
                  onChange={(e) => onUpdateSettings({ ...settings, backgroundColor: e.target.value })}
                  className="size-7 rounded border cursor-pointer"
                />
                <Input
                  value={settings.backgroundColor || "#f4f4f7"}
                  onChange={(e) => onUpdateSettings({ ...settings, backgroundColor: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            {/* Content Background Color */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Content Background Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.contentBackgroundColor || "#ffffff"}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, contentBackgroundColor: e.target.value })
                  }
                  className="size-7 rounded border cursor-pointer"
                />
                <Input
                  value={settings.contentBackgroundColor || "#ffffff"}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, contentBackgroundColor: e.target.value })
                  }
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            {/* Default Font */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Default Font</Label>
              <Select
                value={settings.defaultFont}
                onValueChange={(val) => onUpdateSettings({ ...settings, defaultFont: val })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial, Helvetica, sans-serif">Arial</SelectItem>
                  <SelectItem value="'Helvetica Neue', Helvetica, Arial, sans-serif">Helvetica</SelectItem>
                  <SelectItem value="Georgia, serif">Georgia</SelectItem>
                  <SelectItem value="'Trebuchet MS', sans-serif">Trebuchet MS</SelectItem>
                  <SelectItem value="Verdana, Geneva, sans-serif">Verdana</SelectItem>
                  <SelectItem value="'Times New Roman', Times, serif">Times New Roman</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Link Color */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Link Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.linkColor || "#1C472A"}
                  onChange={(e) => onUpdateSettings({ ...settings, linkColor: e.target.value })}
                  className="size-7 rounded border cursor-pointer"
                />
                <Input
                  value={settings.linkColor || "#1C472A"}
                  onChange={(e) => onUpdateSettings({ ...settings, linkColor: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t space-y-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Email Metadata
            </span>

            {/* Subject Line */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Subject Line</Label>
              <Input
                value={metadata.subject}
                onChange={(e) => onUpdateMetadata({ ...metadata, subject: e.target.value })}
                placeholder="Subject shown in recipient's inbox..."
                className="text-xs"
              />
            </div>

            {/* Preheader */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Preheader Text</Label>
              <Input
                value={metadata.preheader}
                onChange={(e) => onUpdateMetadata({ ...metadata, preheader: e.target.value })}
                placeholder="Preview snippet shown next to subject..."
                className="text-xs"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
