"use client";

import { useState, useEffect, useTransition } from "react";
import { sendBroadcastEmail, getAudienceCounts } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Megaphone, Sparkles, Send, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type AudienceType = "all" | "founding_business" | "founding_neighbour" | "partner_interest";

export function BroadcastEmailDialog() {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [counts, setCounts] = useState<{
    all: number;
    founding_business: number;
    founding_neighbour: number;
    partner_interest: number;
  }>({ all: 0, founding_business: 0, founding_neighbour: 0, partner_interest: 0 });

  const [audience, setAudience] = useState<AudienceType>("all");

  useEffect(() => {
    if (open) {
      getAudienceCounts().then(setCounts).catch(console.error);
    }
  }, [open]);

  // Preset templates for broadcast
  const templates = {
    launch_update: {
      id: "launch_update",
      name: "Community Launch Announcement",
      audience: "all" as AudienceType,
      subject: "Hello Linden is officially live! Welcome to our digital neighborhood",
      message: `Dear Neighbors and Local Partners,

We are thrilled to announce that Hello Linden is officially live!

As one of our early registered members, you are the cornerstone of this initiative. Hello Linden was created to reconnect our neighborhood, champion local independent businesses, and keep our community safe and informed.

What you can do today:
• Discover verified Linden businesses in our local directory.
• Browse exclusive Love Local promotions from nearby cafes, artisans, and service providers.
• Connect with neighbors and receive official updates from our Ward Councillor.

Thank you for being part of Linden's vibrant future. Let's make our neighborhood thrive together!

Warm regards,
The Hello Linden Team
hellohyperlocal.co.za`,
    },
    business_spotlight: {
      id: "business_spotlight",
      name: "Founding Business Onboarding",
      audience: "founding_business" as AudienceType,
      subject: "Your Hello Linden Founding Business Listing & Window Decals",
      message: `Dear Linden Business Owner,

Thank you for joining Hello Linden as a verified Founding Business!

Your business listing is now active in our local neighborhood directory. Neighbors in Linden can view your trading hours, contact details, and location directly in the app.

Next steps for your business:
• Window Decals: If you requested an official Hello Linden window decal, our community ambassadors will be visiting your storefront this week to deliver it.
• Love Local Specials: Would you like to feature a special neighborhood promotion in the app? Simply reply to this email with your offer.
• Profile Updates: Reply here if you would like to add photos, menus, or update any details on your listing.

Thank you for making Linden an incredible place to live, shop, and gather!

Warm regards,
The Hello Linden Team
hellohyperlocal.co.za`,
    },
    neighbour_welcome: {
      id: "neighbour_welcome",
      name: "Founding Neighbours Update",
      audience: "founding_neighbour" as AudienceType,
      subject: "A warm welcome to our Founding Linden Neighbours",
      message: `Dear Neighbor,

Thank you for being an early champion of Hello Linden!

Our community is built on local connection and neighborly trust. Here are a few ways you can make the most of Hello Linden right now:

• Stay Informed: Get real-time municipal alerts and maintenance bulletins directly from Ward 99 and local civic leaders.
• Support Local: Explore our directory of independent Linden shops, coffee spots, and local services.
• Join the Conversation: Post recommendations, community notices, and discover upcoming neighborhood activities.

We are so glad to have you with us. See you around the neighborhood!

Warm regards,
The Hello Linden Team
hellohyperlocal.co.za`,
    },
    custom: {
      id: "custom",
      name: "Custom Broadcast",
      audience: "all" as AudienceType,
      subject: "Announcement from Hello Linden",
      message: `Dear Neighbors,

`,
    },
  };

  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("launch_update");
  const [subject, setSubject] = useState<string>(templates.launch_update.subject);
  const [message, setMessage] = useState<string>(templates.launch_update.message);

  const handleSelectTemplate = (key: string) => {
    setSelectedTemplateKey(key);
    const tmpl = templates[key as keyof typeof templates];
    if (tmpl) {
      setSubject(tmpl.subject);
      setMessage(tmpl.message);
      if (tmpl.audience) setAudience(tmpl.audience);
    }
  };

  const currentAudienceCount = counts[audience] ?? 0;

  const handleConfirmSend = () => {
    setConfirmOpen(false);
    startTransition(async () => {
      const result = await sendBroadcastEmail({
        audience,
        subject,
        message,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to send broadcast.");
      } else {
        toast.success(
          result.simulated
            ? `Simulated broadcast sent to ${result.count} recipients.`
            : `Broadcast email delivered to ${result.count} recipients.`
        );
        setOpen(false);
      }
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 border-border shadow-xs hover:bg-accent"
            title="Send an email to a group or all registrations"
          >
            <Megaphone className="h-4 w-4 text-primary" />
            <span>Group Email</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Megaphone className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle>Broadcast Email to Sign-Ups</DialogTitle>
                <DialogDescription>
                  Send an official announcement or update to registered founding members.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Target Audience Selector */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Select Target Audience</span>
                <span className="text-xs text-muted-foreground">
                  Recipients: <strong className="text-foreground">{currentAudienceCount}</strong>
                </span>
              </Label>
              <Select value={audience} onValueChange={(v) => setAudience(v as AudienceType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Registrations ({counts.all} recipients)
                  </SelectItem>
                  <SelectItem value="founding_business">
                    Founding Businesses Only ({counts.founding_business} recipients)
                  </SelectItem>
                  <SelectItem value="founding_neighbour">
                    Founding Neighbours Only ({counts.founding_neighbour} recipients)
                  </SelectItem>
                  <SelectItem value="partner_interest">
                    Partner Interests ({counts.partner_interest} recipients)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Template Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Preset Templates
                </Label>
                <span className="text-xs text-muted-foreground">Auto-fill message content</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(templates).map(([key, tmpl]) => {
                  const isSelected = selectedTemplateKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectTemplate(key)}
                      className={`flex flex-col items-start rounded-md border p-2 text-left text-xs transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10 font-medium text-primary shadow-2xs"
                          : "border-border bg-background hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <span>{tmpl.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label htmlFor="broadcast-subject" className="text-sm font-medium">
                Subject Line
              </Label>
              <Input
                id="broadcast-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Hello Linden is Live!"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="broadcast-message" className="text-sm font-medium">
                  Message Body
                </Label>
                <span className="text-xs text-muted-foreground">Formatted as branded HTML paragraphs</span>
              </div>
              <Textarea
                id="broadcast-message"
                rows={9}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your broadcast update here..."
                className="font-sans text-sm leading-relaxed"
              />
            </div>

            {/* Info notice */}
            <div className="rounded-md border border-emerald-500/20 bg-emerald-50/50 p-2.5 text-xs text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                Will be delivered individually to each recipient via Resend using official Hello Linden templates.
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!subject.trim()) {
                  toast.error("Please enter a subject line.");
                  return;
                }
                if (!message.trim()) {
                  toast.error("Please enter a message body.");
                  return;
                }
                setConfirmOpen(true);
              }}
              disabled={pending || !subject.trim() || !message.trim() || currentAudienceCount === 0}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Review & Send ({currentAudienceCount})</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog before sending broadcast */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle>Send Broadcast to {currentAudienceCount} Recipients?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-2 pt-2 text-sm text-muted-foreground">
              <p>
                You are about to dispatch this email to <strong>{currentAudienceCount}</strong> registered users in the{" "}
                <strong>{audience.replace(/_/g, " ")}</strong> group.
              </p>
              <div className="rounded border bg-muted/40 p-2.5 text-xs">
                <span className="font-semibold text-foreground">Subject: </span>
                {subject}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSend}
              disabled={pending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirm & Send Broadcast
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
