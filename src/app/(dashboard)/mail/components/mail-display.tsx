"use client";

import { useState, useTransition } from "react";
import { addDays, addHours, format, nextSaturday } from "date-fns";
import {
  Archive,
  ArchiveX,
  Clock,
  MoreVertical,
  Reply,
  Star,
  Trash2,
  Send,
  Sparkles,
  CheckCircle2,
  CornerDownRight,
  ShieldCheck,
  User,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { type Mail, type Account, accounts as defaultAccounts } from "../data";
import { sendReplyAction, updateThreadStateAction } from "../actions";
import { TemplatePickerPopover } from "./template-picker-popover";
import type { MailMessageRow } from "@/lib/mail";

interface MailDisplayProps {
  mail: Mail | null;
  activeAccount?: Account;
  onThreadUpdated?: (updatedMail: Mail) => void;
  onThreadRemoved?: (threadId: string) => void;
}

export function MailDisplay({
  mail,
  activeAccount = defaultAccounts[0],
  onThreadUpdated,
  onThreadRemoved,
}: MailDisplayProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [replyText, setReplyText] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!mail) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-[52px] items-center px-4">
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" disabled className="size-8">
              <Archive className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" disabled className="size-8">
              <Trash2 className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" disabled className="size-8">
              <Star className="size-4" />
            </Button>
          </div>
        </div>
        <Separator />
        <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center p-8 text-center">
          <p className="text-sm">No message selected</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Select an inquiry or registration from the list to view the conversation.
          </p>
        </div>
      </div>
    );
  }

  const messages: MailMessageRow[] = mail.messages && mail.messages.length > 0
    ? mail.messages
    : [
        {
          id: `initial-${mail.id}`,
          thread_id: mail.id,
          direction: "inbound",
          from_email: mail.email,
          from_name: mail.name,
          to_email: activeAccount.email,
          to_name: activeAccount.label,
          subject: mail.subject,
          body_text: mail.text,
          body_html: null,
          template_id: null,
          sent_by_admin_id: null,
          created_at: mail.date,
        },
      ];

  const handleSendReply = () => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply message before sending.");
      return;
    }

    startTransition(async () => {
      const res = await sendReplyAction({
        threadId: mail.id,
        fromEmail: activeAccount.email,
        fromName: activeAccount.label,
        toEmail: mail.email,
        toName: mail.name,
        subject: mail.subject.startsWith("Re:") ? mail.subject : `Re: ${mail.subject}`,
        bodyText: replyText,
        templateId: selectedTemplateId,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(`Reply sent to ${mail.email} via Resend`);
      setReplyText("");
      setSelectedTemplateId(null);

      // Optimistically update conversation
      if (res.message && onThreadUpdated) {
        onThreadUpdated({
          ...mail,
          status: "replied",
          messages: [...messages, res.message],
        });
      }
    });
  };

  const handleToggleStar = () => {
    const next = !mail.is_starred;
    if (onThreadUpdated) onThreadUpdated({ ...mail, is_starred: next });
    startTransition(async () => {
      await updateThreadStateAction(mail.id, { is_starred: next });
      toast.success(next ? "Conversation starred" : "Conversation unstarred");
    });
  };

  const handleToggleArchive = () => {
    const next = !mail.is_archived;
    if (onThreadRemoved) onThreadRemoved(mail.id);
    startTransition(async () => {
      await updateThreadStateAction(mail.id, { is_archived: next });
      toast.success(next ? "Thread archived" : "Thread moved to inbox");
    });
  };

  const handleMoveToTrash = () => {
    if (onThreadRemoved) onThreadRemoved(mail.id);
    startTransition(async () => {
      await updateThreadStateAction(mail.id, { is_trashed: true });
      toast.success("Thread moved to trash");
    });
  };

  const handleToggleRead = () => {
    const nextStatus = mail.status === "unread" ? "read" : "unread";
    const nextRead = nextStatus === "read";
    if (onThreadUpdated) onThreadUpdated({ ...mail, status: nextStatus, read: nextRead });
    startTransition(async () => {
      await updateThreadStateAction(mail.id, { status: nextStatus });
    });
  };

  const handleSnooze = (date: Date) => {
    const iso = date.toISOString();
    if (onThreadRemoved) onThreadRemoved(mail.id);
    startTransition(async () => {
      await updateThreadStateAction(mail.id, { snoozed_until: iso });
      toast.success(`Thread snoozed until ${format(date, "PPp")}`);
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Top Action Toolbar */}
      <div className="flex h-[52px] items-center px-4">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleArchive}
            title={mail.is_archived ? "Move to inbox" : "Archive"}
            className="size-8 cursor-pointer"
          >
            <Archive className="size-4" />
            <span className="sr-only">Archive</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMoveToTrash}
            title="Move to trash"
            className="size-8 cursor-pointer"
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Move to trash</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleStar}
            title={mail.is_starred ? "Unstar" : "Star"}
            className={`size-8 cursor-pointer ${mail.is_starred ? "text-amber-500 fill-amber-500" : ""}`}
          >
            <Star className="size-4" />
            <span className="sr-only">Star</span>
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Snooze Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="Snooze"
                className="size-8 cursor-pointer"
              >
                <Clock className="size-4" />
                <span className="sr-only">Snooze</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flex w-auto p-0" align="start">
              <div className="flex flex-col gap-2 border-r px-2 py-4">
                <div className="px-4 text-sm font-medium">Snooze until</div>
                <div className="grid min-w-[220px] gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start font-normal cursor-pointer"
                    onClick={() => handleSnooze(addHours(new Date(), 4))}
                  >
                    Later today{" "}
                    <span className="text-muted-foreground ml-auto text-xs">
                      {format(addHours(new Date(), 4), "h:mm b")}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start font-normal cursor-pointer"
                    onClick={() => handleSnooze(addDays(new Date(), 1))}
                  >
                    Tomorrow
                    <span className="text-muted-foreground ml-auto text-xs">
                      {format(addDays(new Date(), 1), "E, h:mm b")}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start font-normal cursor-pointer"
                    onClick={() => handleSnooze(nextSaturday(new Date()))}
                  >
                    This weekend
                    <span className="text-muted-foreground ml-auto text-xs">
                      {format(nextSaturday(new Date()), "E, h:mm b")}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start font-normal cursor-pointer"
                    onClick={() => handleSnooze(addDays(new Date(), 7))}
                  >
                    Next week
                    <span className="text-muted-foreground ml-auto text-xs">
                      {format(addDays(new Date(), 7), "E, h:mm b")}
                    </span>
                  </Button>
                </div>
              </div>
              <div className="p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      handleSnooze(date);
                    }
                  }}
                  required
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Badge variant="outline" className="text-[11px] capitalize font-normal">
            {mail.status || "unread"}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
                <MoreVertical className="size-4" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem className="cursor-pointer" onClick={handleToggleRead}>
                Mark as {mail.status === "unread" ? "read" : "unread"}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={handleToggleStar}>
                {mail.is_starred ? "Unstar conversation" : "Star conversation"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(mail.email);
                  toast.success("Recipient email copied to clipboard.");
                }}
              >
                Copy email address
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleMoveToTrash}>
                Move to trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator />

      {/* Thread Conversation Body & Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Subject Header */}
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground leading-snug">
            {mail.subject}
          </h2>
          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
            <span>{mail.category ? mail.category.replace(/_/g, " ") : "General Enquiry"}</span>
            <span>•</span>
            <span>{mail.email}</span>
            {mail.labels && mail.labels.length > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                {mail.labels.map((l) => (
                  <Badge key={l} variant="secondary" className="text-[10px] py-0 px-1.5">
                    {l}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Chronological Message Timeline */}
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isOutbound = msg.direction === "outbound";
            return (
              <div
                key={msg.id || index}
                className={`rounded-lg border p-4 transition-all ${
                  isOutbound
                    ? "bg-muted/40 border-primary/20 ml-4 sm:ml-8"
                    : "bg-background border-border"
                }`}
              >
                {/* Message Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage />
                      <AvatarFallback className="text-xs font-semibold">
                        {isOutbound ? (
                          <ShieldCheck className="size-4 text-primary" />
                        ) : (
                          (msg.from_name || "U")
                            .split(" ")
                            .map((c) => c[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground">
                          {isOutbound ? msg.from_name : msg.from_name}
                        </span>
                        {isOutbound ? (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1 font-medium bg-primary/10 text-primary">
                            Admin Reply
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 px-1">
                            Inbound Submission
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {isOutbound ? `To: ${msg.to_email}` : `From: ${msg.from_email}`}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {msg.created_at ? format(new Date(msg.created_at), "PPp") : ""}
                  </span>
                </div>

                {/* Message Content */}
                <div className="mt-3 text-xs leading-relaxed whitespace-pre-wrap text-foreground/90 pl-11">
                  {msg.body_text}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Outbound Reply Composer */}
      <div className="p-4 bg-muted/20">
        <form onSubmit={(e) => { e.preventDefault(); handleSendReply(); }}>
          <div className="space-y-3">
            {/* Composer Header Bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                <Reply className="size-3.5 text-primary shrink-0" />
                <span className="truncate">
                  Replying as <strong className="text-foreground">{activeAccount.label}</strong> ({activeAccount.email})
                </span>
              </div>

              {/* Template Quick-Insert */}
              <TemplatePickerPopover
                recipientName={mail.name}
                recipientEmail={mail.email}
                category={mail.category}
                onSelectTemplate={(text, tmplId) => {
                  setReplyText(text);
                  setSelectedTemplateId(tmplId);
                }}
              />
            </div>

            {/* Reply Textarea */}
            <Textarea
              className="min-h-[110px] p-3 text-xs resize-none bg-background cursor-text"
              placeholder={`Write a reply to ${mail.name}... or click "Insert Template" above.`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />

            {/* Footer with Send Button */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Delivered via Resend to {mail.email}
              </span>
              <Button
                type="submit"
                size="sm"
                disabled={pending || !replyText.trim()}
                className="gap-2 cursor-pointer font-medium"
              >
                <Send className="size-3.5" />
                {pending ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
