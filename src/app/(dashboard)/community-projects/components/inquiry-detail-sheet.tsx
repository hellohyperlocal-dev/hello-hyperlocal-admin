"use client"

import { useState, useTransition } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  Trash2,
  ExternalLink,
  CheckCircle2,
  HeartHandshake,
} from "lucide-react"
import { toast } from "sonner"
import { deleteInquiryAction, updateInquiryStatusAction } from "../actions"
import type {
  CommunityProjectInquiry,
  InquiryStatus,
} from "@/lib/community-projects-types"
import { CONTRIBUTION_TYPE_CONFIG } from "@/lib/community-projects-types"

interface InquiryDetailSheetProps {
  inquiry: CommunityProjectInquiry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange?: (id: string, newStatus: InquiryStatus) => void
  onDeleteInquiry?: (id: string) => void
}

export function InquiryDetailSheet({
  inquiry,
  open,
  onOpenChange,
  onStatusChange,
  onDeleteInquiry,
}: InquiryDetailSheetProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!inquiry) return null

  const cleanPhone = inquiry.phone.replace(/[^0-9]/g, "").replace(/^0/, "")
  const waUrl = `https://wa.me/27${cleanPhone}?text=${encodeURIComponent(
    `Hi ${inquiry.resident_name}, thank you for reaching out regarding the ${inquiry.project_title} project on Hello Linden!`
  )}`
  const mailUrl = `mailto:${inquiry.email}?subject=${encodeURIComponent(
    `Hello Linden: ${inquiry.project_title}`
  )}`

  const handleStatusUpdate = (newStatus: InquiryStatus) => {
    startTransition(async () => {
      const res = await updateInquiryStatusAction(inquiry.id, newStatus)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Inquiry marked as ${newStatus}.`)
        onStatusChange?.(inquiry.id, newStatus)
      }
    })
  }

  const handleDeleteConfirm = () => {
    startTransition(async () => {
      const res = await deleteInquiryAction(inquiry.id)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(`Inquiry from "${inquiry.resident_name}" was deleted.`)
      setDeleteDialogOpen(false)
      onOpenChange(false)
      onDeleteInquiry?.(inquiry.id)
    })
  }

  const formattedDate = new Date(inquiry.created_at).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:w-[500px] data-[side=right]:sm:w-[500px] data-[side=right]:!max-w-[500px] p-0 flex flex-col h-full overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-1.5 pr-8">
              <div className="flex items-center gap-2 flex-wrap">
                <SheetTitle className="text-xl font-bold">{inquiry.resident_name}</SheetTitle>
              </div>

              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <Badge
                  variant="outline"
                  className={
                    inquiry.status === "new"
                      ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
                      : inquiry.status === "contacted"
                      ? "bg-blue-500/10 text-blue-700 border-blue-500/30"
                      : "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                  }
                >
                  {inquiry.status === "new"
                    ? "New Lead"
                    : inquiry.status === "contacted"
                    ? "Contacted"
                    : "Connected"}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <HeartHandshake className="size-4 text-primary shrink-0" />
                Inquiry for <strong className="text-foreground">{inquiry.project_title}</strong>
              </p>
            </div>

            <Separator />

            {/* Contact Details Card */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Contact Information
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground font-medium">Phone Number</p>
                  <p className="font-semibold text-foreground mt-0.5">{inquiry.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Email Address</p>
                  <p className="font-semibold text-foreground mt-0.5 truncate">{inquiry.email}</p>
                </div>
              </div>

              {inquiry.street_address && (
                <div className="pt-2 border-t border-border/50 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-primary shrink-0" />
                  <span>{inquiry.street_address}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                <Calendar className="size-3.5 shrink-0" />
                <span>Submitted {formattedDate}</span>
              </div>
            </div>

            {/* Quick Action Buttons: WhatsApp & Email */}
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 cursor-pointer flex-1"
              >
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" />
                  WhatsApp Resident
                  <ExternalLink className="size-3 opacity-70 ml-auto" />
                </a>
              </Button>

              <Button asChild variant="outline" className="gap-2 cursor-pointer flex-1">
                <a href={mailUrl}>
                  <Mail className="size-4" />
                  Send Email
                </a>
              </Button>
            </div>

            <Separator />

            {/* Offers / Contributions */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                How They Want to Get Involved
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {inquiry.contribution_types.length === 0 ? (
                  <span className="text-xs text-muted-foreground">General interest</span>
                ) : (
                  inquiry.contribution_types.map((type) => {
                    const cfg = CONTRIBUTION_TYPE_CONFIG[type] || {
                      label: type,
                      badgeClass: "bg-muted text-muted-foreground",
                    }
                    return (
                      <Badge
                        key={type}
                        variant="outline"
                        className={`text-xs px-2.5 py-0.5 font-medium ${cfg.badgeClass}`}
                      >
                        {cfg.label}
                      </Badge>
                    )
                  })
                )}
              </div>
            </div>

            {/* Resident Message */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Resident Message &amp; Notes
              </h4>
              <div className="rounded-lg border bg-background p-3.5 text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed min-h-[90px]">
                {inquiry.message || "No additional message provided."}
              </div>
            </div>

            {/* Status Workflow Selector */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Follow-up Workflow Status
              </h4>
              <Select
                value={inquiry.status}
                onValueChange={(val) => handleStatusUpdate(val as InquiryStatus)}
                disabled={pending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Lead (Awaiting initial contact)</SelectItem>
                  <SelectItem value="contacted">Contacted (Follow-up underway)</SelectItem>
                  <SelectItem value="connected">Connected (Onboarded / Pledged)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="p-4 border-t bg-background flex items-center justify-between gap-2">
            {inquiry.status !== "connected" && (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1.5 text-xs"
                onClick={() => handleStatusUpdate("connected")}
                disabled={pending}
              >
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                Mark Connected
              </Button>
            )}

            <Button
              variant="destructive"
              size="sm"
              className="cursor-pointer gap-1.5 ml-auto"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={pending}
            >
              <Trash2 className="size-3.5" />
              Delete Inquiry
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this inquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the inquiry from <strong>{inquiry.resident_name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete Inquiry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
