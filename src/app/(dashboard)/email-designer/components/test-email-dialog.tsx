"use client";

import { useState } from "react";
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
import { sendDesignerTestEmailAction } from "@/lib/email-designer/actions";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

interface TestEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  compiledHtml: string;
}

export function TestEmailDialog({
  open,
  onOpenChange,
  subject,
  compiledHtml,
}: TestEmailDialogProps) {
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!recipient || !recipient.includes("@")) {
      toast.error("Please enter a valid recipient email address.");
      return;
    }

    setSending(true);
    try {
      const res = await sendDesignerTestEmailAction({
        to: recipient,
        subject: subject || "Test Email Preview",
        html: compiledHtml,
      });

      if (res.success) {
        if (res.error) {
          toast.info(res.error);
        } else {
          toast.success(`Test email sent to ${recipient}`);
        }
        onOpenChange(false);
      } else {
        toast.error(res.error || "Failed to send test email");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Send className="size-4 text-[#1C472A]" />
            Send Test Email
          </DialogTitle>
          <DialogDescription>
            Send a preview of this email to your inbox to check rendering across email clients.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label htmlFor="test-recipient" className="text-xs font-semibold">
              Recipient Email Address
            </Label>
            <Input
              id="test-recipient"
              type="email"
              placeholder="e.g. yourname@example.com"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              autoFocus
            />
          </div>

          <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Sender Details</p>
            <p>From: Hello Linden &lt;noreply@hellohyperlocal.co.za&gt;</p>
            <p className="truncate">Subject: [TEST] {subject || "(No subject)"}</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="bg-[#1C472A] text-white hover:bg-[#1C472A]/90 gap-1.5"
          >
            {sending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                Send Test
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
