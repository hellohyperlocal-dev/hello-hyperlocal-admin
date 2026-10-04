"use client";

import * as React from "react";
import { Send, User, Building, MapPin, Loader2, Sparkles } from "lucide-react";
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
import { TemplatePickerPopover } from "./template-picker-popover";

interface MailComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  defaultFromEmail?: string;
  onThreadCreated?: (threadId: string) => void;
}

export function MailComposeDialog({
  open,
  onOpenChange,
  accounts,
  defaultFromEmail,
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
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const activeAccount = accounts.find((a) => a.email === fromEmail) || accounts[0];

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
    setSelectedTemplateId(null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    const recipientEmail = toInput.trim();
    if (!recipientEmail || !recipientEmail.includes("@")) {
      toast.error("Please enter a valid recipient email address.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject.");
      return;
    }
    if (!bodyText.trim()) {
      toast.error("Please enter email body content.");
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
        templateId: selectedTemplateId,
        category: recipient?.category || "general_enquiry",
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(`Email dispatched to ${recipientEmail} via Resend`);
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
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden">
        <form onSubmit={handleSend}>
          <DialogHeader className="p-4 pb-2 border-b">
            <DialogTitle className="text-base font-semibold">New Message</DialogTitle>
            <DialogDescription className="text-xs">
              Compose an outgoing email dispatched via Resend and recorded in thread history.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 space-y-3">
            {/* From Selector */}
            <div className="grid grid-cols-[60px_1fr] items-center gap-2">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Select value={fromEmail} onValueChange={setFromEmail}>
                <SelectTrigger className="h-8 text-xs cursor-pointer">
                  <SelectValue placeholder="Select sender account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.email} value={acc.email} className="cursor-pointer text-xs">
                      <div className="flex items-center gap-2">
                        {acc.icon}
                        <span className="font-medium">{acc.label}</span>
                        <span className="text-muted-foreground text-[11px]">({acc.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* To Recipient Input with Autocomplete */}
            <div className="grid grid-cols-[60px_1fr] items-start gap-2 relative">
              <Label className="text-xs text-muted-foreground pt-2">To</Label>
              <div className="relative w-full">
                <Input
                  className="h-8 text-xs cursor-text"
                  placeholder="Enter email or search registrations / businesses..."
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
                  <div className="absolute left-0 top-9 z-50 w-full rounded-md border bg-popover shadow-md overflow-hidden">
                    <ScrollArea className="max-h-[200px] p-1">
                      <div className="flex flex-col gap-0.5">
                        {suggestions.map((sugg) => (
                          <button
                            key={sugg.email}
                            type="button"
                            className="w-full text-left p-2 rounded hover:bg-muted text-xs transition-colors flex items-center justify-between cursor-pointer"
                            onClick={() => handleSelectSuggestion(sugg)}
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-foreground truncate">
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

            {/* Subject Input & Template Picker */}
            <div className="grid grid-cols-[60px_1fr] items-center gap-2">
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <div className="flex items-center gap-2">
                <Input
                  className="h-8 text-xs cursor-text flex-1"
                  placeholder="Subject line"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <TemplatePickerPopover
                  recipientName={recipient?.name || toInput}
                  recipientEmail={toInput}
                  category={recipient?.category}
                  onSelectTemplate={(text, tmplId) => {
                    setBodyText(text);
                    setSelectedTemplateId(tmplId);
                    if (!subject.trim()) {
                      setSubject(recipient?.name ? `Hello ${recipient.name} - Hello Linden` : "Hello Linden");
                    }
                  }}
                />
              </div>
            </div>

            {/* Email Body */}
            <div className="space-y-1">
              <Textarea
                className="min-h-[180px] p-3 text-xs resize-none bg-background cursor-text"
                placeholder="Write your email content or select a template above..."
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="p-3 border-t bg-muted/20 flex items-center justify-between sm:justify-between">
            <span className="text-[11px] text-muted-foreground">
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
                disabled={isSubmitting || !toInput.trim() || !subject.trim() || !bodyText.trim()}
                className="cursor-pointer text-xs gap-1.5 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" />
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
