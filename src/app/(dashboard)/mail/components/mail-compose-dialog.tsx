"use client";

import * as React from "react";
import {
  Send,
  Loader2,
  Sparkles,
  Eye,
  PenLine,
  X,
  Palette,
  Check,
  FileCode,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { Account } from "../data";
import { composeEmailAction, searchRecipientsAction, type RecipientSuggestion } from "../actions";
import {
  TemplatePickerPopover,
  SelectedTemplateData,
} from "./template-picker-popover";
import { getDesignerTemplateByIdAction } from "@/lib/email-designer/actions";
import { STARTER_TEMPLATES } from "@/lib/email-designer/presets";
import { compileEmailDocumentToHtml } from "@/lib/email-designer/compiler";

interface MailComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  defaultFromEmail?: string;
  initialTemplateId?: string | null;
  onThreadCreated?: (threadId: string) => void;
}

export function MailComposeDialog({
  open,
  onOpenChange,
  accounts,
  defaultFromEmail,
  initialTemplateId,
  onThreadCreated,
}: MailComposeDialogProps) {
  const [fromEmail, setFromEmail] = React.useState<string>(
    defaultFromEmail || accounts[0]?.email || ""
  );
  const [toInput, setToInput] = React.useState("");
  const [recipient, setRecipient] = React.useState<RecipientSuggestion | null>(null);
  const [suggestions, setSuggestions] = React.useState<RecipientSuggestion[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const [subject, setSubject] = React.useState("");
  const [bodyText, setBodyText] = React.useState("");
  const [bodyHtml, setBodyHtml] = React.useState<string | null>(null);
  const [activeTemplateTitle, setActiveTemplateTitle] = React.useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<"text" | "preview">("text");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const activeAccount = accounts.find((a) => a.email === fromEmail) || accounts[0];

  // Auto-load template if initialTemplateId is provided when opened
  React.useEffect(() => {
    if (!open || !initialTemplateId) return;

    let mounted = true;
    const starter = STARTER_TEMPLATES.find((s) => s.id === initialTemplateId);
    if (starter) {
      const html = compileEmailDocumentToHtml(starter);
      setSubject(starter.subject || starter.name);
      setBodyHtml(html);
      setBodyText(
        `${starter.name}\n\n${starter.description || ""}\n\n[Full visual design active in HTML preview]`
      );
      setActiveTemplateTitle(starter.name);
      setSelectedTemplateId(starter.id);
      setViewMode("preview");
      return;
    }

    getDesignerTemplateByIdAction(initialTemplateId).then((res) => {
      if (!mounted) return;
      if (res.success && res.template) {
        const tmpl = res.template;
        setSubject(tmpl.subject || tmpl.name);
        setBodyHtml(tmpl.html_content || compileEmailDocumentToHtml(tmpl.design));
        setBodyText(
          `${tmpl.name}\n\n${tmpl.description || ""}\n\n[Full visual design active in HTML preview]`
        );
        setActiveTemplateTitle(tmpl.name);
        setSelectedTemplateId(tmpl.id);
        setViewMode("preview");
      }
    });

    return () => {
      mounted = false;
    };
  }, [open, initialTemplateId]);

  // Debounced search when typing recipient
  React.useEffect(() => {
    if (recipient && recipient.email === toInput.trim()) {
      return;
    }

    const trimmed = toInput.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchRecipientsAction(trimmed);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        console.error("Autocomplete search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [toInput, recipient]);

  const handleSelectSuggestion = (sugg: RecipientSuggestion) => {
    setRecipient(sugg);
    setToInput(sugg.email);
    setShowSuggestions(false);
  };

  const handleReset = () => {
    setToInput("");
    setRecipient(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setSubject("");
    setBodyText("");
    setBodyHtml(null);
    setActiveTemplateTitle(null);
    setSelectedTemplateId(null);
    setViewMode("text");
  };

  const handleTemplateSelected = (
    data: SelectedTemplateData | string,
    legacyTmplId?: string
  ) => {
    if (typeof data === "string") {
      setBodyText(data);
      setSelectedTemplateId(legacyTmplId || null);
      setBodyHtml(null);
      setActiveTemplateTitle(null);
      setViewMode("text");
      return;
    }

    setBodyText(data.text);
    if (data.html) {
      setBodyHtml(data.html);
      setActiveTemplateTitle(data.title);
      setViewMode("preview");
    } else {
      setBodyHtml(null);
      setActiveTemplateTitle(null);
      setViewMode("text");
    }

    setSelectedTemplateId(data.templateId);
    if (data.subject && (!subject.trim() || subject === "Hello Linden")) {
      setSubject(data.subject);
    }
  };

  const handleClearTemplate = () => {
    setBodyHtml(null);
    setActiveTemplateTitle(null);
    setSelectedTemplateId(null);
    setViewMode("text");
    toast.info("Template removed. Writing standard email.");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    const recipientEmail = toInput.trim();
    if (!recipientEmail || !recipientEmail.includes("@")) {
      toast.error("Please enter a valid recipient email address.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter an email subject.");
      return;
    }
    if (!bodyText.trim() && !bodyHtml) {
      toast.error("Please enter email content before sending.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await composeEmailAction({
        fromEmail: activeAccount.email,
        fromName: activeAccount.label,
        toEmail: recipientEmail,
        toName: recipient?.name || recipientEmail,
        subject: subject.trim(),
        bodyText: bodyText.trim(),
        bodyHtml: bodyHtml || null,
        templateId: selectedTemplateId,
        category: recipient?.category || "general_enquiry",
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(
        bodyHtml
          ? `Rich template email dispatched to ${recipientEmail} via Resend`
          : `Email dispatched to ${recipientEmail} via Resend`
      );
      handleReset();
      onOpenChange(false);

      if (res.threadId && onThreadCreated) {
        onThreadCreated(res.threadId);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to compose email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleReset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl">
        <form onSubmit={handleSend} className="flex flex-col h-full min-h-0">
          {/* Header */}
          <DialogHeader className="px-6 py-3.5 border-b shrink-0 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>New Message</span>
                  {bodyHtml && (
                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-[#1C472A] border-primary/20 gap-1 font-semibold">
                      <Palette className="size-3 text-primary" />
                      HTML Template Active
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Compose an outgoing email dispatched via Resend and recorded in thread history.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Content */}
          <div className="px-6 py-3 space-y-3 shrink-0 border-b bg-muted/5">
            {/* From Selector */}
            <div className="grid grid-cols-[64px_1fr] items-center gap-2">
              <Label className="text-xs font-semibold text-muted-foreground">From</Label>
              <Select value={fromEmail} onValueChange={setFromEmail}>
                <SelectTrigger className="h-8 text-xs cursor-pointer bg-background">
                  <SelectValue placeholder="Select sender account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.email} value={acc.email} className="cursor-pointer text-xs">
                      <div className="flex items-center gap-2">
                        {acc.icon}
                        <span className="font-semibold">{acc.label}</span>
                        <span className="text-muted-foreground text-[11px]">({acc.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* To Recipient Input with Autocomplete */}
            <div className="grid grid-cols-[64px_1fr] items-start gap-2 relative">
              <Label className="text-xs font-semibold text-muted-foreground pt-2">To</Label>
              <div className="relative w-full">
                <Input
                  className="h-8 text-xs cursor-text bg-background"
                  placeholder="Enter recipient email or search community members & businesses..."
                  value={toInput}
                  onChange={(e) => {
                    setToInput(e.target.value);
                    if (recipient && e.target.value !== recipient.email) {
                      setRecipient(null);
                    }
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                />

                {isSearching && (
                  <div className="absolute right-2.5 top-2 text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                  </div>
                )}

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 top-9 z-50 w-full rounded-md border bg-popover shadow-lg overflow-hidden">
                    <ScrollArea className="max-h-[220px] p-1">
                      <div className="flex flex-col gap-0.5">
                        {suggestions.map((sugg) => (
                          <button
                            key={sugg.email}
                            type="button"
                            className="w-full text-left p-2.5 rounded-md hover:bg-muted text-xs transition-colors flex items-center justify-between cursor-pointer"
                            onClick={() => handleSelectSuggestion(sugg)}
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-foreground truncate">
                                {sugg.name}
                              </span>
                              <span className="text-muted-foreground text-[11px] truncate">
                                {sugg.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              {sugg.suburb && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal">
                                  {sugg.suburb}
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-[10px] py-0 px-1 font-normal capitalize">
                                {sugg.category.replace(/_/g, " ")}
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>

            {/* Subject Input (Full width, clean) */}
            <div className="grid grid-cols-[64px_1fr] items-center gap-2">
              <Label className="text-xs font-semibold text-muted-foreground">Subject</Label>
              <Input
                className="h-8 text-xs cursor-text bg-background font-medium"
                placeholder="Write an email subject line..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          {/* DEDICATED TOOLBAR (Template Picker, Active Badge, Preview/Text Switcher) */}
          <div className="px-6 py-2 border-b bg-card flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Clean Template Picker Popover */}
              <TemplatePickerPopover
                recipientName={recipient?.name || toInput}
                recipientEmail={toInput}
                category={recipient?.category}
                onSelectTemplate={handleTemplateSelected}
                align="start"
              />

              {/* Active Template Indicator Badge */}
              {activeTemplateTitle && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs text-[#1C472A]">
                  <Palette className="size-3 text-primary shrink-0" />
                  <span className="font-semibold truncate max-w-[220px]">
                    {activeTemplateTitle}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearTemplate}
                    title="Remove template"
                    className="p-0.5 hover:bg-black/10 rounded-full transition-colors ml-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              )}
            </div>

            {/* View Switcher: Edit Notes vs HTML Preview (Active when template or HTML is loaded) */}
            {bodyHtml && (
              <div className="flex items-center border rounded-md p-0.5 bg-muted/40">
                <Button
                  type="button"
                  variant={viewMode === "preview" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("preview")}
                  className={`h-7 px-2.5 text-xs font-medium gap-1 ${
                    viewMode === "preview" ? "bg-background shadow-xs text-foreground font-semibold" : "text-muted-foreground"
                  }`}
                >
                  <Eye className="size-3 text-primary" />
                  HTML Preview
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "text" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("text")}
                  className={`h-7 px-2.5 text-xs font-medium gap-1 ${
                    viewMode === "text" ? "bg-background shadow-xs text-foreground font-semibold" : "text-muted-foreground"
                  }`}
                >
                  <PenLine className="size-3" />
                  Edit Message
                </Button>
              </div>
            )}
          </div>

          {/* MAIN MESSAGE / PREVIEW AREA */}
          <div className="flex-1 min-h-[300px] sm:min-h-[360px] overflow-hidden flex flex-col bg-background">
            {viewMode === "preview" && bodyHtml ? (
              /* Live HTML Preview Container */
              <div className="flex-1 w-full h-full p-4 bg-muted/10 overflow-hidden flex flex-col items-center">
                <div className="w-full max-w-[680px] h-full rounded-lg border bg-white shadow-sm overflow-hidden flex flex-col">
                  <div className="px-3 py-1.5 border-b bg-muted/20 text-[11px] font-mono text-muted-foreground flex items-center justify-between shrink-0">
                    <span>Rendering Responsive HTML Output</span>
                    <span className="text-[10px] text-green-700 font-semibold flex items-center gap-1">
                      <Check className="size-3" />
                      Client Ready
                    </span>
                  </div>
                  <iframe
                    srcDoc={bodyHtml}
                    title="Email Preview"
                    className="w-full flex-1 border-0 min-h-[300px]"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            ) : (
              /* Plain Text / Notes Editor */
              <div className="flex-1 p-4 flex flex-col">
                <Textarea
                  className="flex-1 min-h-[280px] p-4 text-sm leading-relaxed resize-none bg-background border rounded-lg focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder={
                    bodyHtml
                      ? "Add an optional plain text note to accompany this template..."
                      : "Write your email message here, or choose 'Insert Template' above to load a pre-designed layout..."
                  }
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-3 border-t bg-muted/20 flex items-center justify-between sm:justify-between shrink-0">
            <span className="text-xs text-muted-foreground">
              Dispatched from <strong className="text-foreground">{activeAccount.email}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleReset();
                  onOpenChange(false);
                }}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !toInput.trim() || !subject.trim() || (!bodyText.trim() && !bodyHtml)}
                className="cursor-pointer text-xs gap-1.5 font-medium bg-[#1C472A] text-white hover:bg-[#1C472A]/90 px-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="size-3.5 text-[#7ED957]" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
