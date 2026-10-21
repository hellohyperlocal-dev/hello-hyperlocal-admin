"use client";

import * as React from "react";
import {
  Sparkles,
  ChevronDown,
  Search,
  Palette,
  MessageSquareText,
  Layers,
  ArrowRight,
  Store,
  Newspaper,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EMAIL_TEMPLATES } from "@/lib/email-templates/templates";
import { STARTER_TEMPLATES } from "@/lib/email-designer/presets";
import { getDesignerTemplatesAction } from "@/lib/email-designer/actions";
import { EmailDesignerTemplateRecord } from "@/lib/email-designer/types";
import { compileEmailDocumentToHtml } from "@/lib/email-designer/compiler";
import { toast } from "sonner";

export interface SelectedTemplateData {
  text: string;
  html?: string;
  templateId: string;
  subject?: string;
  title: string;
}

interface TemplatePickerPopoverProps {
  recipientName?: string;
  recipientEmail?: string;
  category?: string;
  onSelectTemplate: (
    data: SelectedTemplateData,
    legacyTemplateId?: string
  ) => void;
  align?: "start" | "center" | "end";
}

export function TemplatePickerPopover({
  recipientName,
  recipientEmail,
  category,
  onSelectTemplate,
  align = "start",
}: TemplatePickerPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"designer" | "system">("designer");
  const [designerTemplates, setDesignerTemplates] = React.useState<EmailDesignerTemplateRecord[]>([]);
  const [loadingDesigner, setLoadingDesigner] = React.useState(false);

  // Load custom designer templates when popover opens
  React.useEffect(() => {
    if (!open) return;

    let mounted = true;
    setLoadingDesigner(true);
    getDesignerTemplatesAction()
      .then((res) => {
        if (!mounted) return;
        if (res.success && res.templates) {
          setDesignerTemplates(res.templates);
        }
      })
      .catch((err) => console.error("Error loading designer templates:", err))
      .finally(() => {
        if (mounted) setLoadingDesigner(false);
      });

    return () => {
      mounted = false;
    };
  }, [open]);

  // Merge starter templates with saved user templates (avoid duplicates)
  const allDesignerTemplates = React.useMemo(() => {
    const list: {
      id: string;
      name: string;
      description?: string | null;
      category?: string;
      subject?: string;
      html: string;
      isCustom?: boolean;
    }[] = [];

    // 1. User saved templates
    designerTemplates.forEach((t) => {
      list.push({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        subject: t.subject,
        html: t.html_content || compileEmailDocumentToHtml(t.design),
        isCustom: true,
      });
    });

    // 2. Curated starter templates (excluding Blank Canvas)
    STARTER_TEMPLATES.filter((s) => s.id !== "starter-blank").forEach((s) => {
      if (!list.some((existing) => existing.id === s.id)) {
        list.push({
          id: s.id,
          name: s.name,
          description: s.description,
          category: s.category,
          subject: s.subject,
          html: compileEmailDocumentToHtml(s),
          isCustom: false,
        });
      }
    });

    return list;
  }, [designerTemplates]);

  // Filter Designer Templates
  const filteredDesignerTemplates = React.useMemo(() => {
    if (!search.trim()) return allDesignerTemplates;
    const q = search.toLowerCase();
    return allDesignerTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q))
    );
  }, [allDesignerTemplates, search]);

  // Filter System Templates
  const filteredSystemTemplates = React.useMemo(() => {
    if (!search.trim()) return EMAIL_TEMPLATES;
    const q = search.toLowerCase();
    return EMAIL_TEMPLATES.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [search]);

  // Handle selecting a Designer template
  const handleSelectDesignerTemplate = (tmpl: {
    id: string;
    name: string;
    subject?: string;
    html: string;
    description?: string | null;
  }) => {
    const fallbackText = `${tmpl.name}\n\n${tmpl.description || ""}\n\nView the full email design in the HTML preview tab.`;

    onSelectTemplate({
      text: fallbackText,
      html: tmpl.html,
      templateId: tmpl.id,
      subject: tmpl.subject || tmpl.name,
      title: tmpl.name,
    });
    setOpen(false);
    toast.success(`Loaded email template: "${tmpl.name}"`);
  };

  // Handle selecting a System template
  const handleSelectSystemTemplate = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    const vars: Record<string, string> = {};
    template.variables.forEach((v) => {
      if (v.key === "name") {
        vars[v.key] = recipientName || "Neighbor";
      } else if (v.key === "email") {
        vars[v.key] = recipientEmail || "resident@hellolinden.co.za";
      } else if (v.key === "category" && category) {
        vars[v.key] = category;
      } else {
        vars[v.key] = String(v.defaultValue ?? "");
      }
    });

    const rendered = template.renderPlainText(vars);
    const renderedHtml = template.renderHtml ? template.renderHtml(vars) : undefined;

    onSelectTemplate(
      {
        text: rendered,
        html: renderedHtml,
        templateId: template.id,
        subject: template.defaultSubject,
        title: template.title,
      },
      template.id
    );

    setOpen(false);
    toast.success(`Inserted template: "${template.title}"`);
  };

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case "business":
        return <Store className="size-3.5 text-primary" />;
      case "notice":
      case "municipal":
        return <Megaphone className="size-3.5 text-primary" />;
      case "newsletter":
      default:
        return <Newspaper className="size-3.5 text-primary" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs cursor-pointer h-8 border-dashed hover:border-solid hover:bg-primary/5 transition-all"
        >
          <Sparkles className="size-3.5 text-primary" />
          <span className="font-medium">Insert Template</span>
          <ChevronDown className="size-3 opacity-60 ml-0.5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[420px] sm:w-[460px] p-0 shadow-lg border rounded-xl overflow-hidden"
        align={align}
        sideOffset={6}
      >
        <div className="p-3 border-b bg-muted/20 space-y-2">
          <div className="relative">
            <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search templates and canned replies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs cursor-text bg-background"
              autoFocus
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "designer" | "system")}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2 h-7 p-0.5 bg-muted/60">
              <TabsTrigger
                value="designer"
                className="text-[11px] font-semibold gap-1.5 data-[state=checked]:bg-background data-[state=checked]:shadow-xs"
              >
                <Palette className="size-3 text-primary" />
                Designed Templates ({filteredDesignerTemplates.length})
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="text-[11px] font-semibold gap-1.5 data-[state=checked]:bg-background data-[state=checked]:shadow-xs"
              >
                <MessageSquareText className="size-3" />
                Quick Responses ({filteredSystemTemplates.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* TAB 1: DESIGNED TEMPLATES (From Email Designer) */}
        {activeTab === "designer" && (
          <ScrollArea className="max-h-[320px] p-2">
            {filteredDesignerTemplates.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                <Layers className="size-7 text-muted-foreground/40 mx-auto" />
                <p>No designed templates found.</p>
                <p className="text-[11px]">
                  Create new layouts anytime in the <strong>Email Designer</strong>.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {filteredDesignerTemplates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectDesignerTemplate(tmpl)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-primary/5 hover:border-primary/40 border border-transparent transition-all flex items-start justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="size-7 rounded-md bg-[#1C472A] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {getCategoryIcon(tmpl.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-foreground group-hover:text-[#1C472A] truncate">
                            {tmpl.name}
                          </span>
                          {tmpl.isCustom && (
                            <Badge variant="outline" className="text-[9px] py-0 px-1 font-medium bg-primary/10 text-[#1C472A] border-primary/20 shrink-0">
                              Custom
                            </Badge>
                          )}
                        </div>
                        {tmpl.subject && (
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            Subject: {tmpl.subject}
                          </p>
                        )}
                        {tmpl.description && (
                          <p className="text-[10px] text-muted-foreground/80 line-clamp-1 mt-0.5">
                            {tmpl.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center text-xs font-semibold text-muted-foreground group-hover:text-[#1C472A] mt-1">
                      <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        )}

        {/* TAB 2: SYSTEM TEMPLATES & CANNED RESPONSES */}
        {activeTab === "system" && (
          <ScrollArea className="max-h-[320px] p-2">
            {filteredSystemTemplates.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No quick response templates found.
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {filteredSystemTemplates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectSystemTemplate(tmpl.id)}
                    className="w-full text-left p-2 rounded-lg hover:bg-muted text-xs transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-medium text-foreground group-hover:text-[#1C472A] truncate">
                        {tmpl.title}
                      </span>
                      <span className="text-muted-foreground text-[11px] line-clamp-1">
                        {tmpl.description}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1 font-normal capitalize shrink-0">
                      {tmpl.category}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        )}

        <div className="p-2 border-t bg-muted/10 text-center text-[10px] text-muted-foreground">
          Tip: Selecting a designed template automatically attaches its responsive HTML layout.
        </div>
      </PopoverContent>
    </Popover>
  );
}
