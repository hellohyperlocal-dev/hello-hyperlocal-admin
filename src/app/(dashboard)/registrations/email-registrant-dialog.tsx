"use client";

import { useState, useTransition } from "react";
import { RegistrationDetail } from "@/lib/registrations";
import { sendRegistrantEmail } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, Sparkles, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface EmailRegistrantDialogProps {
  registration: RegistrationDetail;
  recipientTitle?: string;
}

export function EmailRegistrantDialog({
  registration,
  recipientTitle,
}: EmailRegistrantDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const recipientName =
    registration.full_name ||
    [registration.first_name, registration.last_name].filter(Boolean).join(" ") ||
    registration.business_name ||
    recipientTitle ||
    "Neighbor";

  const businessName = registration.business_name || "your business";
  const email = registration.email;
  const isBusiness =
    registration.primaryRole === "founding_business" ||
    registration.roles?.includes("founding_business") ||
    registration.roles?.includes("business") ||
    Boolean(registration.business_name);

  // Template generators
  const getTemplates = () => ({
    business_welcome: {
      id: "business_welcome",
      name: "Founding Business Welcome",
      badge: "Founding Business",
      subject: `Welcome to Hello Linden! Your Founding Business is Live`,
      message: `Hi ${recipientName},

Thank you for registering ${businessName} as a Founding Business on Hello Linden! We are excited to partner with you in championing independent local businesses in our neighborhood.

Your business is now featured in our verified Linden directory. Neighbors across Linden can discover your offerings, trading hours, and exclusive Love Local promotions directly within the app.
${
  registration.wants_window_sticker
    ? `\nWe also noted that you requested an official Hello Linden window decal — our team is currently preparing these and will be dropping yours off at ${
        registration.business_address || "your premises"
      } soon!`
    : ""
}
If you would like to update your business profile, share a special promotion, or connect with our community team, simply reply directly to this email.

Warm regards,
The Hello Linden Team
hellohyperlocal.co.za`,
    },
    neighbour_welcome: {
      id: "neighbour_welcome",
      name: "Founding Neighbour Welcome",
      badge: "Founding Neighbour",
      subject: `Welcome to Hello Linden! Your Neighborhood Town Square`,
      message: `Hi ${recipientName},

Welcome to Hello Linden! As one of our Founding Neighbours, you are playing a vital role in building a safer, closer, and more vibrant community.

Through Hello Linden, you can:
• Stay up to date with verified municipal alerts and ward updates directly from your Ward Councillor.
• Discover and support independent Linden businesses.
• Connect with neighbors for local recommendations, safety alerts, and community initiatives.

Thank you for joining us from the very beginning. We're thrilled to have you with us!

Warm regards,
The Hello Linden Team
hellohyperlocal.co.za`,
    },
    sticker_update: {
      id: "sticker_update",
      name: "Window Decal Update",
      badge: "Decal Delivery",
      subject: `Your Official Hello Linden Window Sticker is Ready!`,
      message: `Hi ${recipientName},

Great news! Your official Hello Linden window decal has been prepared and is ready for you.

Our team is doing rounds across Linden this week to drop off stickers. Displaying your sticker in your front window or storefront helps neighbors easily recognize and connect with verified local supporters.

Thank you for proudly supporting our neighborhood!

Warm regards,
The Hello Linden Team
hellohyperlocal.co.za`,
    },
    custom: {
      id: "custom",
      name: "Custom Message",
      badge: "Community Update",
      subject: `Update from Hello Linden`,
      message: `Hi ${recipientName},

`,
    },
  });

  const templates = getTemplates();
  const defaultTemplateKey = isBusiness ? "business_welcome" : "neighbour_welcome";

  const [selectedTemplate, setSelectedTemplate] = useState<string>(defaultTemplateKey);
  const [subject, setSubject] = useState<string>(templates[defaultTemplateKey].subject);
  const [message, setMessage] = useState<string>(templates[defaultTemplateKey].message);
  const [badgeLabel, setBadgeLabel] = useState<string>(templates[defaultTemplateKey].badge);

  const handleSelectTemplate = (key: string) => {
    setSelectedTemplate(key);
    const tmpl = templates[key as keyof typeof templates];
    if (tmpl) {
      setSubject(tmpl.subject);
      setMessage(tmpl.message);
      setBadgeLabel(tmpl.badge);
    }
  };

  const handleSend = () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject line.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    startTransition(async () => {
      const result = await sendRegistrantEmail({
        to: email,
        recipientName,
        subject,
        message,
        badgeLabel,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to send email.");
      } else {
        toast.success(
          result.simulated
            ? `Simulated email sent to ${recipientName} (${email})`
            : `Email delivered to ${recipientName} (${email})`
        );
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
        >
          <Mail className="h-4 w-4" />
          <span>Email Registrant</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>Email Registrant</DialogTitle>
              <DialogDescription>
                Send a branded message directly to this sign-up from Hello Linden admin.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Recipient Details Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">To:</span>
              <span className="font-semibold text-foreground">{recipientName}</span>
              <span className="text-muted-foreground">&lt;{email}&gt;</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-xs">
                {registration.primaryRole ? registration.primaryRole.replace(/_/g, " ") : "Registrant"}
              </Badge>
              {registration.wants_window_sticker && (
                <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                  Wants Sticker
                </Badge>
              )}
            </div>
          </div>

          {/* Template Quick Select */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Template Presets
              </Label>
              <span className="text-xs text-muted-foreground">Select a preset to prefill</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(templates).map(([key, tmpl]) => {
                const isSelected = selectedTemplate === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectTemplate(key)}
                    className={`flex flex-col items-start justify-between rounded-md border p-2 text-left text-xs transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 font-medium text-primary shadow-2xs"
                        : "border-border bg-background hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <span>{tmpl.name}</span>
                    <span className="mt-1 text-[10px] text-muted-foreground">{tmpl.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="email-subject" className="text-sm font-medium">
              Subject Line
            </Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Welcome to Hello Linden!"
            />
          </div>

          {/* Message Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-message" className="text-sm font-medium">
                Message Body
              </Label>
              <span className="text-xs text-muted-foreground">Paragraphs and bullet points supported</span>
            </div>
            <Textarea
              id="email-message"
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your email message here..."
              className="font-sans text-sm leading-relaxed"
            />
          </div>

          {/* Email Envelope Notice */}
          <div className="rounded-md border border-emerald-500/20 bg-emerald-50/50 p-2.5 text-xs text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <span className="font-semibold">Branded Delivery:</span> Sent with official Hello Linden styling from{" "}
              <code className="rounded bg-emerald-100/60 dark:bg-emerald-900/40 px-1 py-0.5">noreply@hellohyperlocal.co.za</code>.
              Replies route to <code className="rounded bg-emerald-100/60 dark:bg-emerald-900/40 px-1 py-0.5">info@hellohyperlocal.co.za</code>.
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={pending || !subject.trim() || !message.trim()}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending email...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send Email</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
