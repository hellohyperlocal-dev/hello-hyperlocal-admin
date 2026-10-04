"use client";

import * as React from "react";
import { Sparkles, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EMAIL_TEMPLATES } from "@/lib/email-templates/templates";
import { toast } from "sonner";

interface TemplatePickerPopoverProps {
  recipientName: string;
  recipientEmail: string;
  category?: string;
  onSelectTemplate: (renderedText: string, templateId: string) => void;
}

export function TemplatePickerPopover({
  recipientName,
  recipientEmail,
  category,
  onSelectTemplate,
}: TemplatePickerPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredTemplates = React.useMemo(() => {
    if (!search.trim()) return EMAIL_TEMPLATES;
    const q = search.toLowerCase();
    return EMAIL_TEMPLATES.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSelect = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    // Build dynamic variable values using available recipient data
    const vars: Record<string, string> = {};
    template.variables.forEach((v) => {
      if (v.key === "name") {
        vars[v.key] = recipientName || "Neighbor";
      } else if (v.key === "email") {
        vars[v.key] = recipientEmail;
      } else if (v.key === "category" && category) {
        vars[v.key] = category;
      } else {
        vars[v.key] = String(v.defaultValue ?? "");
      }
    });

    const rendered = template.renderPlainText(vars);
    onSelectTemplate(rendered, template.id);
    setOpen(false);
    toast.success(`Inserted template: "${template.title}"`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs cursor-pointer h-8"
        >
          <Sparkles className="size-3 text-primary" />
          <span>Insert Template</span>
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs cursor-text"
            />
          </div>
        </div>
        <ScrollArea className="max-h-[260px] p-1">
          {filteredTemplates.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No template found.
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {filteredTemplates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleSelect(tmpl.id)}
                  className="w-full text-left p-2 rounded-md hover:bg-muted text-xs transition-colors cursor-pointer flex flex-col gap-0.5"
                >
                  <div className="flex w-full items-center justify-between font-medium">
                    <span className="text-foreground">{tmpl.title}</span>
                    <span className="capitalize text-[10px] text-muted-foreground font-normal bg-muted px-1.5 py-0.2 rounded">
                      {tmpl.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground line-clamp-1">
                    {tmpl.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

