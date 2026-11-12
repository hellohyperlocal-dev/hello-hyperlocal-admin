"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONTRIBUTION_TYPE_CONFIG,
  type CommunityProjectInquiry,
  type InquiryStatus,
} from "@/lib/community-projects-types";
import { updateInquiryStatusAction, deleteInquiryAction } from "../actions";
import { toast } from "sonner";
import {
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface InquiryDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiry: CommunityProjectInquiry | null;
  onStatusChange?: (id: string, newStatus: InquiryStatus) => void;
  onDelete?: (id: string) => void;
}

export function InquiryDetailDialog({
  open,
  onOpenChange,
  inquiry,
  onStatusChange,
  onDelete,
}: InquiryDetailDialogProps) {
  const [isPending, startTransition] = React.useTransition();

  if (!inquiry) return null;

  // Format WhatsApp Link
  const cleanPhone = inquiry.phone.replace(/[^0-9]/g, "").replace(/^0/, "");
  const waUrl = `https://wa.me/27${cleanPhone}?text=${encodeURIComponent(
    `Hi ${inquiry.resident_name}, thank you for reaching out regarding the ${inquiry.project_title} project on Hello Linden!`
  )}`;

  // Format Email Link
  const mailUrl = `mailto:${inquiry.email}?subject=${encodeURIComponent(
    `Hello Linden: ${inquiry.project_title}`
  )}`;

  const handleStatusUpdate = (newStatus: InquiryStatus) => {
    startTransition(async () => {
      const res = await updateInquiryStatusAction(inquiry.id, newStatus);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Inquiry marked as ${newStatus}.`);
        onStatusChange?.(inquiry.id, newStatus);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete this inquiry from ${inquiry.resident_name}?`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteInquiryAction(inquiry.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Inquiry deleted.");
        onOpenChange(false);
        onDelete?.(inquiry.id);
      }
    });
  };

  const formattedDate = new Date(inquiry.created_at).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-bold">
                {inquiry.resident_name}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Inquiry for <span className="font-semibold text-foreground">{inquiry.project_title}</span>
              </DialogDescription>
            </div>
            <Select
              value={inquiry.status}
              onValueChange={(val) => handleStatusUpdate(val as InquiryStatus)}
              disabled={isPending}
            >
              <SelectTrigger className="w-32 h-8 text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New Lead</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="connected">Connected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Contact Details Card */}
          <div className="rounded-lg border border-border/70 bg-muted/30 p-3.5 space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground font-medium">Phone / WhatsApp</p>
                <p className="font-semibold text-foreground mt-0.5">{inquiry.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Email Address</p>
                <p className="font-semibold text-foreground mt-0.5 truncate">{inquiry.email}</p>
              </div>
            </div>

            {inquiry.street_address && (
              <div className="pt-1 border-t border-border/50 flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span>{inquiry.street_address}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
              <Calendar className="size-3.5 shrink-0" />
              <span>Submitted on {formattedDate}</span>
            </div>
          </div>

          {/* Quick Direct Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5"
            >
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-3.5" />
                Chat on WhatsApp
                <ExternalLink className="size-3 opacity-70" />
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1.5"
            >
              <a href={mailUrl}>
                <Mail className="size-3.5" />
                Send Email
              </a>
            </Button>

            {inquiry.status !== "connected" && (
              <Button
                variant="secondary"
                size="sm"
                className="text-xs h-8 gap-1.5"
                onClick={() => handleStatusUpdate("connected")}
                disabled={isPending}
              >
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                Mark Connected
              </Button>
            )}
          </div>

          {/* Ways They Want to Help */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contribution Offers
            </p>
            <div className="flex flex-wrap gap-1.5">
              {inquiry.contribution_types.length === 0 ? (
                <span className="text-xs text-muted-foreground">General interest</span>
              ) : (
                inquiry.contribution_types.map((type) => {
                  const cfg = CONTRIBUTION_TYPE_CONFIG[type] || {
                    label: type,
                    badgeClass: "bg-muted text-muted-foreground",
                  };
                  return (
                    <Badge
                      key={type}
                      variant="outline"
                      className={`text-xs px-2.5 py-0.5 font-medium ${cfg.badgeClass}`}
                    >
                      {cfg.label}
                    </Badge>
                  );
                })
              )}
            </div>
          </div>

          {/* Message / Notes */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Resident Message &amp; Notes
            </p>
            <div className="rounded-lg border border-border/80 bg-background p-3.5 text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed min-h-[80px]">
              {inquiry.message || "No additional message provided."}
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="text-destructive hover:bg-destructive/10 text-xs h-8"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin mr-1" />
            ) : (
              <Trash2 className="size-3.5 mr-1" />
            )}
            Delete Inquiry
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
