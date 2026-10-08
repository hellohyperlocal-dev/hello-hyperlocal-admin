"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Phone,
  MessageCircle,
  Copy,
  Mail,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Pencil,
  Trash2,
  Store,
  UserCheck,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { suspendUser, unsuspendUser, deleteUser } from "../actions"
import type { UserRow } from "@/lib/users"

interface UserDetailSheetProps {
  user: UserRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdated?: (updated: UserRow) => void
  onUserDeleted?: (id: string) => void
}

function getWhatsAppUrl(phone: string) {
  let cleaned = phone.replace(/\D/g, "")
  if (cleaned.startsWith("0")) {
    cleaned = "27" + cleaned.slice(1)
  }
  return `https://wa.me/${cleaned}`
}

export function UserDetailSheet({
  user,
  open,
  onOpenChange,
  onUserUpdated,
  onUserDeleted,
}: UserDetailSheetProps) {
  const [pending, startTransition] = useTransition()
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [suspendReason, setSuspendReason] = useState("")

  if (!user) return null

  const isBusiness = user.role === "business" || Boolean(user.business_name)
  const displayName = user.full_name || user.business_name || "User"

  const handleToggleSuspend = () => {
    if (user.is_suspended) {
      // Unsuspend
      startTransition(async () => {
        const res = await unsuspendUser(user.id)
        if (res.error) {
          toast.error(res.error)
          return
        }
        toast.success(`"${displayName}" has been activated.`)
        onUserUpdated?.({
          ...user,
          is_suspended: false,
          suspended_at: null,
          suspended_reason: null,
        })
      })
    } else {
      // Open suspend dialog
      setSuspendDialogOpen(true)
    }
  }

  const handleConfirmSuspend = () => {
    if (!suspendReason.trim()) {
      toast.error("Please provide a reason for suspension.")
      return
    }

    startTransition(async () => {
      const res = await suspendUser(user.id, suspendReason.trim())
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(`"${displayName}" has been suspended.`)
      setSuspendDialogOpen(false)
      onUserUpdated?.({
        ...user,
        is_suspended: true,
        suspended_at: new Date().toISOString(),
        suspended_reason: suspendReason.trim(),
      })
      setSuspendReason("")
    })
  }

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const res = await deleteUser(user.id)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(`"${displayName}" was permanently deleted.`)
      setDeleteDialogOpen(false)
      onOpenChange(false)
      onUserDeleted?.(user.id)
    })
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:w-[500px] data-[side=right]:sm:w-[500px] data-[side=right]:!max-w-[500px] p-0 flex flex-col h-full overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <SheetHeader className="p-0 text-left space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <SheetTitle className="text-xl font-bold">{displayName}</SheetTitle>
                <Badge variant="outline" className="capitalize">
                  {user.role}
                </Badge>
                <Badge
                  variant={user.is_suspended ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {user.is_suspended ? "Suspended" : "Active"}
                </Badge>
              </div>

              {isBusiness && user.business_name && user.business_name !== user.full_name && (
                <p className="text-sm text-foreground/80 font-medium flex items-center gap-1.5">
                  <Store className="size-3.5 text-primary" />
                  Business: {user.business_name}
                </p>
              )}

              <SheetDescription className="break-all">
                {user.email || user.street_address || `User ID: ${user.id.slice(0, 8)}…`}
              </SheetDescription>
            </SheetHeader>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                Contact Information
              </h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <span className="text-muted-foreground pt-0.5">Email:</span>
                <div className="col-span-2">
                  {user.email ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${user.email}`}
                        className="font-medium hover:underline text-foreground break-all inline-flex items-center gap-1.5"
                      >
                        <Mail className="size-3.5 text-muted-foreground shrink-0" />
                        {user.email}
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="cursor-pointer shrink-0"
                        title="Copy email"
                        onClick={() => {
                          navigator.clipboard.writeText(user.email!)
                          toast.success("Email copied to clipboard.")
                        }}
                      >
                        <Copy className="size-3 text-muted-foreground" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm italic">Not provided</span>
                  )}
                </div>

                <span className="text-muted-foreground pt-0.5">Phone:</span>
                <div className="col-span-2">
                  {user.phone_number ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${user.phone_number}`}
                          className="font-mono text-sm font-semibold hover:underline text-foreground inline-flex items-center gap-1.5"
                        >
                          <Phone className="size-3.5 text-muted-foreground shrink-0" />
                          {user.phone_number}
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="cursor-pointer shrink-0"
                          title="Copy phone number"
                          onClick={() => {
                            navigator.clipboard.writeText(user.phone_number!)
                            toast.success("Phone number copied to clipboard.")
                          }}
                        >
                          <Copy className="size-3 text-muted-foreground" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1.5 cursor-pointer"
                          asChild
                        >
                          <a href={`tel:${user.phone_number}`}>
                            <Phone className="size-3 text-emerald-600" />
                            Call
                          </a>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1.5 cursor-pointer"
                          asChild
                        >
                          <a
                            href={getWhatsAppUrl(user.phone_number)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="size-3 text-emerald-600" />
                            WhatsApp
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm italic">Not provided</span>
                  )}
                </div>

                <span className="text-muted-foreground">Address:</span>
                <span className="col-span-2 font-medium flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                  {user.street_address || "No address provided"}
                </span>

                <span className="text-muted-foreground">Ward:</span>
                <span className="col-span-2 font-medium">{user.ward || "Ward 87"}</span>
              </div>
            </div>

            <Separator />

            {/* Account Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                Account Overview
              </h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-muted-foreground">Account Role:</span>
                <span className="col-span-2">
                  <Badge variant="secondary" className="capitalize">
                    {user.role}
                  </Badge>
                </span>

                {user.business_name && (
                  <>
                    <span className="text-muted-foreground">Business:</span>
                    <span className="col-span-2 font-medium">{user.business_name}</span>
                  </>
                )}

                <span className="text-muted-foreground">Status:</span>
                <span className="col-span-2">
                  <Badge variant={user.is_suspended ? "destructive" : "default"}>
                    {user.is_suspended ? "Suspended" : "Active"}
                  </Badge>
                </span>

                {user.is_suspended && user.suspended_reason && (
                  <>
                    <span className="text-muted-foreground">Reason:</span>
                    <span className="col-span-2 text-destructive font-medium text-xs">
                      {user.suspended_reason}
                    </span>
                  </>
                )}

                <span className="text-muted-foreground">Joined:</span>
                <span className="col-span-2 text-muted-foreground flex items-center gap-1 text-xs">
                  <Clock className="size-3" />
                  {new Date(user.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t bg-muted/30 px-6 py-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full sm:w-auto cursor-pointer"
                  disabled={pending}
                >
                  <Trash2 className="size-4 mr-1.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[95vw] sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to permanently delete &quot;{displayName}&quot;? All
                    associated listings, posts, and session tokens will be removed. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={pending}
                    onClick={(e) => {
                      e.preventDefault()
                      handleConfirmDelete()
                    }}
                  >
                    {pending ? "Deleting…" : "Yes, Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={handleToggleSuspend}
                disabled={pending}
              >
                {user.is_suspended ? (
                  <>
                    <ShieldCheck className="size-3.5 mr-1.5 text-emerald-600" />
                    Unsuspend
                  </>
                ) : (
                  <>
                    <ShieldAlert className="size-3.5 mr-1.5 text-orange-600" />
                    Suspend
                  </>
                )}
              </Button>

              <Button asChild size="sm" className="cursor-pointer">
                <Link href={`/users/${user.id}`} onClick={() => onOpenChange(false)}>
                  <Pencil className="size-3.5 mr-1.5" />
                  Full Profile
                </Link>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Suspend Confirmation Modal */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent className="w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Suspending &quot;{displayName}&quot; immediately revokes their app sessions and hides their posts from the community feed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="suspend-reason">Reason for suspension</Label>
            <Input
              id="suspend-reason"
              placeholder="e.g. Terms violation, abusive behavior..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              disabled={pending || !suspendReason.trim()}
              onClick={(e) => {
                e.preventDefault()
                handleConfirmSuspend()
              }}
            >
              {pending ? "Suspending…" : "Suspend Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
