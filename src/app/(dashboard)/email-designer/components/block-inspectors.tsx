"use client";

import { useState } from "react";
import { EmailBlock } from "@/lib/email-designer/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  Loader2,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface BlockInspectorProps {
  block: EmailBlock;
  onChange: (updatedBlock: EmailBlock) => void;
}

export function BlockInspector({ block, onChange }: BlockInspectorProps) {
  const updateContent = (partial: any) => {
    onChange({
      ...block,
      content: {
        ...block.content,
        ...partial,
      },
    });
  };

  switch (block.type) {
    case "title": {
      const c = block.content as any;
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Title Text</Label>
            <Input
              value={c.text || ""}
              onChange={(e) => updateContent({ text: e.target.value })}
              placeholder="Headline..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Heading Level</Label>
              <Select
                value={c.level || "h1"}
                onValueChange={(val) => updateContent({ level: val })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1 (Main)</SelectItem>
                  <SelectItem value="h2">H2 (Section)</SelectItem>
                  <SelectItem value="h3">H3 (Sub)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Text Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={c.color || "#1C472A"}
                  onChange={(e) => updateContent({ color: e.target.value })}
                  className="size-7 rounded border cursor-pointer"
                />
                <Input
                  value={c.color || "#1C472A"}
                  onChange={(e) => updateContent({ color: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label className="text-xs font-semibold">Font Size</Label>
              <span className="text-muted-foreground">{c.fontSize || 24}px</span>
            </div>
            <Slider
              min={16}
              max={48}
              value={[c.fontSize || 24]}
              onValueChange={([val]) => updateContent({ fontSize: val })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Alignment</Label>
            <div className="flex rounded-md border p-0.5 bg-muted/30">
              {(["left", "center", "right"] as const).map((align) => (
                <Button
                  key={align}
                  type="button"
                  variant={c.align === align ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => updateContent({ align })}
                  className="flex-1 h-7 text-xs capitalize"
                >
                  {align === "left" && <AlignLeft className="size-3.5 mr-1" />}
                  {align === "center" && <AlignCenter className="size-3.5 mr-1" />}
                  {align === "right" && <AlignRight className="size-3.5 mr-1" />}
                  {align}
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Padding</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Top ({c.paddingTop ?? 10}px)</span>
                <Slider
                  min={0}
                  max={40}
                  value={[c.paddingTop ?? 10]}
                  onValueChange={([val]) => updateContent({ paddingTop: val })}
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Bottom ({c.paddingBottom ?? 10}px)</span>
                <Slider
                  min={0}
                  max={40}
                  value={[c.paddingBottom ?? 10]}
                  onValueChange={([val]) => updateContent({ paddingBottom: val })}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "paragraph": {
      const c = block.content as any;
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Content</Label>
            <Textarea
              rows={4}
              value={c.text || ""}
              onChange={(e) => updateContent({ text: e.target.value })}
              placeholder="Write text here..."
              className="text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Text Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={c.color || "#374151"}
                  onChange={(e) => updateContent({ color: e.target.value })}
                  className="size-7 rounded border cursor-pointer"
                />
                <Input
                  value={c.color || "#374151"}
                  onChange={(e) => updateContent({ color: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <Label className="text-xs font-semibold">Font Size</Label>
                <span className="text-muted-foreground">{c.fontSize || 15}px</span>
              </div>
              <Slider
                min={12}
                max={24}
                value={[c.fontSize || 15]}
                onValueChange={([val]) => updateContent({ fontSize: val })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Alignment</Label>
            <div className="flex rounded-md border p-0.5 bg-muted/30">
              {(["left", "center", "right"] as const).map((align) => (
                <Button
                  key={align}
                  type="button"
                  variant={c.align === align ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => updateContent({ align })}
                  className="flex-1 h-7 text-xs capitalize"
                >
                  {align === "left" && <AlignLeft className="size-3.5 mr-1" />}
                  {align === "center" && <AlignCenter className="size-3.5 mr-1" />}
                  {align === "right" && <AlignRight className="size-3.5 mr-1" />}
                  {align}
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Padding</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Top ({c.paddingTop ?? 8}px)</span>
                <Slider
                  min={0}
                  max={40}
                  value={[c.paddingTop ?? 8]}
                  onValueChange={([val]) => updateContent({ paddingTop: val })}
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Bottom ({c.paddingBottom ?? 8}px)</span>
                <Slider
                  min={0}
                  max={40}
                  value={[c.paddingBottom ?? 8]}
                  onValueChange={([val]) => updateContent({ paddingBottom: val })}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "image": {
      const c = block.content as any;
      const [uploading, setUploading] = useState(false);

      const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", "email-designer");

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) throw new Error("Upload failed");
          const json = await res.json();
          if (json.url) {
            updateContent({ url: json.url });
            toast.success("Image uploaded successfully!");
          }
        } catch (err: any) {
          toast.error(err.message || "Failed to upload image");
        } finally {
          setUploading(false);
        }
      };

      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Image Source</Label>
            <div className="flex gap-2">
              <Input
                value={c.url || ""}
                onChange={(e) => updateContent({ url: e.target.value })}
                placeholder="https://..."
                className="text-xs"
              />
              <label className="shrink-0 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  className="h-9 gap-1 text-xs"
                  asChild
                >
                  <span>
                    {uploading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    Upload
                  </span>
                </Button>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Alt Text</Label>
            <Input
              value={c.alt || ""}
              onChange={(e) => updateContent({ alt: e.target.value })}
              placeholder="Descriptive label for screen readers"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Link on Click (optional)</Label>
            <Input
              value={c.linkUrl || ""}
              onChange={(e) => updateContent({ linkUrl: e.target.value })}
              placeholder="https://..."
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label className="text-xs font-semibold">Width</Label>
              <span className="text-muted-foreground">{c.widthPercent || 100}%</span>
            </div>
            <Slider
              min={20}
              max={100}
              value={[c.widthPercent || 100]}
              onValueChange={([val]) => updateContent({ widthPercent: val })}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label className="text-xs font-semibold">Border Radius</Label>
              <span className="text-muted-foreground">{c.borderRadius || 0}px</span>
            </div>
            <Slider
              min={0}
              max={32}
              value={[c.borderRadius || 0]}
              onValueChange={([val]) => updateContent({ borderRadius: val })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Alignment</Label>
            <div className="flex rounded-md border p-0.5 bg-muted/30">
              {(["left", "center", "right"] as const).map((align) => (
                <Button
                  key={align}
                  type="button"
                  variant={c.align === align ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => updateContent({ align })}
                  className="flex-1 h-7 text-xs capitalize"
                >
                  {align}
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "button": {
      const c = block.content as any;
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Button Label</Label>
            <Input
              value={c.text || ""}
              onChange={(e) => updateContent({ text: e.target.value })}
              placeholder="Click Here"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Destination URL</Label>
            <Input
              value={c.url || ""}
              onChange={(e) => updateContent({ url: e.target.value })}
              placeholder="https://..."
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Background Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={c.backgroundColor || "#1C472A"}
                  onChange={(e) => updateContent({ backgroundColor: e.target.value })}
                  className="size-7 rounded border cursor-pointer"
                />
                <Input
                  value={c.backgroundColor || "#1C472A"}
                  onChange={(e) => updateContent({ backgroundColor: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Text Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={c.textColor || "#ffffff"}
                  onChange={(e) => updateContent({ textColor: e.target.value })}
                  className="size-7 rounded border cursor-pointer"
                />
                <Input
                  value={c.textColor || "#ffffff"}
                  onChange={(e) => updateContent({ textColor: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label className="text-xs font-semibold">Corner Rounding</Label>
              <span className="text-muted-foreground">{c.borderRadius ?? 6}px</span>
            </div>
            <Slider
              min={0}
              max={30}
              value={[c.borderRadius ?? 6]}
              onValueChange={([val]) => updateContent({ borderRadius: val })}
            />
          </div>

          <div className="flex items-center justify-between border rounded-md p-2.5">
            <Label className="text-xs font-semibold cursor-pointer">Full Width Button</Label>
            <Switch
              checked={Boolean(c.fullWidth)}
              onCheckedChange={(val) => updateContent({ fullWidth: val })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Alignment</Label>
            <div className="flex rounded-md border p-0.5 bg-muted/30">
              {(["left", "center", "right"] as const).map((align) => (
                <Button
                  key={align}
                  type="button"
                  variant={c.align === align ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => updateContent({ align })}
                  className="flex-1 h-7 text-xs capitalize"
                >
                  {align}
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "divider": {
      const c = block.content as any;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Thickness</Label>
              <Slider
                min={1}
                max={8}
                value={[c.height || 1]}
                onValueChange={([val]) => updateContent({ height: val })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Style</Label>
              <Select
                value={c.style || "solid"}
                onValueChange={(val) => updateContent({ style: val })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Line Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={c.color || "#e5e7eb"}
                onChange={(e) => updateContent({ color: e.target.value })}
                className="size-7 rounded border cursor-pointer"
              />
              <Input
                value={c.color || "#e5e7eb"}
                onChange={(e) => updateContent({ color: e.target.value })}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label className="text-xs font-semibold">Width</Label>
              <span className="text-muted-foreground">{c.widthPercent || 100}%</span>
            </div>
            <Slider
              min={20}
              max={100}
              value={[c.widthPercent || 100]}
              onValueChange={([val]) => updateContent({ widthPercent: val })}
            />
          </div>
        </div>
      );
    }

    case "spacer": {
      const c = block.content as any;
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label className="text-xs font-semibold">Spacer Height</Label>
              <span className="text-muted-foreground">{c.height || 24}px</span>
            </div>
            <Slider
              min={8}
              max={120}
              value={[c.height || 24]}
              onValueChange={([val]) => updateContent({ height: val })}
            />
          </div>
        </div>
      );
    }

    case "list": {
      const c = block.content as any;
      const items: string[] = c.items || [];

      const addItem = () => {
        updateContent({ items: [...items, "New list item"] });
      };

      const updateItem = (index: number, text: string) => {
        const next = [...items];
        next[index] = text;
        updateContent({ items: next });
      };

      const removeItem = (index: number) => {
        updateContent({ items: items.filter((_, i) => i !== index) });
      };

      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">List Style</Label>
            <div className="flex rounded-md border p-0.5 bg-muted/30">
              <Button
                type="button"
                variant={c.listType !== "numbered" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => updateContent({ listType: "bullet" })}
                className="flex-1 h-7 text-xs"
              >
                Bullets (•)
              </Button>
              <Button
                type="button"
                variant={c.listType === "numbered" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => updateContent({ listType: "numbered" })}
                className="flex-1 h-7 text-xs"
              >
                Numbers (1, 2, 3)
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">List Items</Label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <span className="text-xs text-muted-foreground w-4">{idx + 1}.</span>
                <Input
                  value={item}
                  onChange={(e) => updateItem(idx, e.target.value)}
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(idx)}
                  className="size-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="w-full h-8 text-xs gap-1 border-dashed mt-1"
            >
              <Plus className="size-3.5" /> Add Item
            </Button>
          </div>
        </div>
      );
    }

    case "social":
    case "icons": {
      const c = block.content as any;
      const networks: { network: string; url: string }[] = c.networks || [];

      const updateNetworkUrl = (index: number, url: string) => {
        const next = [...networks];
        next[index] = { ...next[index], url };
        updateContent({ networks: next });
      };

      return (
        <div className="space-y-4">
          <Label className="text-xs font-semibold">Social Network Links</Label>
          <div className="space-y-2">
            {networks.map((net, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-[11px] font-medium capitalize text-muted-foreground">{net.network}</span>
                <Input
                  value={net.url || ""}
                  onChange={(e) => updateNetworkUrl(idx, e.target.value)}
                  placeholder={`https://${net.network}.com/...`}
                  className="h-8 text-xs"
                />
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label className="text-xs font-semibold">Icon Size</Label>
              <span className="text-muted-foreground">{c.iconSize || 24}px</span>
            </div>
            <Slider
              min={18}
              max={40}
              value={[c.iconSize || 24]}
              onValueChange={([val]) => updateContent({ iconSize: val })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Alignment</Label>
            <div className="flex rounded-md border p-0.5 bg-muted/30">
              {(["left", "center", "right"] as const).map((align) => (
                <Button
                  key={align}
                  type="button"
                  variant={c.align === align ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => updateContent({ align })}
                  className="flex-1 h-7 text-xs capitalize"
                >
                  {align}
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "html": {
      const c = block.content as any;
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Custom HTML Code</Label>
            <Textarea
              rows={8}
              value={c.code || ""}
              onChange={(e) => updateContent({ code: e.target.value })}
              placeholder="<div>Custom raw email HTML</div>"
              className="text-xs font-mono"
            />
          </div>
        </div>
      );
    }

    case "video": {
      const c = block.content as any;
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Video Title</Label>
            <Input
              value={c.title || ""}
              onChange={(e) => updateContent({ title: e.target.value })}
              placeholder="Watch Video"
              className="text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Video URL</Label>
            <Input
              value={c.videoUrl || ""}
              onChange={(e) => updateContent({ videoUrl: e.target.value })}
              placeholder="https://youtube.com/..."
              className="text-xs"
            />
          </div>
        </div>
      );
    }

    case "menu": {
      const c = block.content as any;
      const items: { label: string; url: string }[] = c.items || [];

      const addItem = () => {
        updateContent({ items: [...items, { label: "Link", url: "#" }] });
      };

      const updateItem = (index: number, partial: any) => {
        const next = [...items];
        next[index] = { ...next[index], ...partial };
        updateContent({ items: next });
      };

      const removeItem = (index: number) => {
        updateContent({ items: items.filter((_, i) => i !== index) });
      };

      return (
        <div className="space-y-4">
          <Label className="text-xs font-semibold">Menu Navigation Links</Label>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  value={item.label}
                  onChange={(e) => updateItem(idx, { label: e.target.value })}
                  placeholder="Label"
                  className="h-8 text-xs w-28 shrink-0"
                />
                <Input
                  value={item.url}
                  onChange={(e) => updateItem(idx, { url: e.target.value })}
                  placeholder="URL"
                  className="h-8 text-xs flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(idx)}
                  className="size-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="w-full h-8 text-xs gap-1 border-dashed mt-1"
            >
              <Plus className="size-3.5" /> Add Navigation Item
            </Button>
          </div>
        </div>
      );
    }

    case "table": {
      const c = block.content as any;
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between border rounded-md p-2.5">
            <Label className="text-xs font-semibold cursor-pointer">Has Table Header</Label>
            <Switch
              checked={Boolean(c.hasHeader)}
              onCheckedChange={(val) => updateContent({ hasHeader: val })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Border Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={c.borderColor || "#e5e7eb"}
                onChange={(e) => updateContent({ borderColor: e.target.value })}
                className="size-7 rounded border cursor-pointer"
              />
              <Input
                value={c.borderColor || "#e5e7eb"}
                onChange={(e) => updateContent({ borderColor: e.target.value })}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
