"use client";

import { useState, useTransition } from "react";
import { RegistrationDetail } from "@/lib/registrations";
import { sendRegistrantEmail } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

  const templates: Record<string, { name: string; subject: string; message: string }> = {
    business_welcome: {
      name: "Founding Business Welcome",
      subject: "Welcome to Hello Linden! Your Founding Business is Live",
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
      name: "Founding Neighbour Welcome",
      subject: "Welcome to Hello Linden! Your Neighborhood Town Square",
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
      name: "Window Decal Update",
      subject: "Your Official Hello Linden Window Sticker is Ready!",
      message: `Hi ${recipientName},

Great news! Your official Hello Linden window decal has been prepared and is ready for you.

Our team is doing rounds across Linden this week to drop off stickers. Displaying your sticker in your front window or storefront helps neighbors easily recognize and connect with verified local supporters.

Thank you for proudly supporting our neighborhood!

Warm regards,
The Hello Linden Team
hellohyperlocal.co.za`,
    },
    custom: {
      name: "Custom Message",
      subject: "Update from Hello Linden",
      message: `Hi ${recipientName},

`,
    },
  };

  const defaultTemplateKey = isBusiness ? "business_welcome" : "neighbour_welcome";

  const [selectedTemplate, setSelectedTemplate] = useState<string>(defaultTemplateKey);
  const [subject, setSubject] = useState<string>(templates[defaultTemplateKey].subject);
  const [message, setMessage] = useState<string>(templates[defaultTemplateKey].message);

  const handleSelectTemplate = (key: string) => {
    setSelectedTemplate(key);
    const tmpl = templates[key];
    if (tmpl) {
      setSubject(tmpl.subject);
      setMessage(tmpl.message);
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
      });

      if (!result.success) {
        toast.error(result.error || "Failed to send email.");
      } else {
        toast.success(
          result.simulated
            ? `Simulated email sent to ${recipientName} (${email})`
            : `Email sent to ${recipientName}.`
        );
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Email registrant</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Email {recipientName}</DialogTitle>
          <DialogDescription>
            Send an email directly to {email}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Template</Label>
            <Select value={selectedTemplate} onValueChange={handleSelectTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business_welcome">Founding Business Welcome</SelectItem>
                <SelectItem value="neighbour_welcome">Founding Neighbour Welcome</SelectItem>
                <SelectItem value="sticker_update">Window Decal Update</SelectItem>
                <SelectItem value="custom">Custom Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email-subject">Subject</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject line"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email-message">Message</Label>
            <Textarea
              id="email-message"
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your email message here…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={pending || !subject.trim() || !message.trim()}
          >
            {pending ? "Sending…" : "Send email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
