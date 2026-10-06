"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Phone, MessageCircle, Copy, Store, Mail } from "lucide-react"
import { toast } from "sonner"
import type { RegistrationUser } from "./data-table"

interface RegistrationDetailSheetProps {
  user: RegistrationUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getWhatsAppUrl(phone: string) {
  let cleaned = phone.replace(/\D/g, "")
  if (cleaned.startsWith("0")) {
    cleaned = "27" + cleaned.slice(1)
  }
  return `https://wa.me/${cleaned}`
}

export function RegistrationDetailSheet({
  user,
  open,
  onOpenChange,
}: RegistrationDetailSheetProps) {
  if (!user) return null

  const isBusiness = user.category === "Business" || Boolean(user.businessName)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[500px] data-[side=right]:sm:w-[500px] data-[side=right]:!max-w-[500px] p-0 flex flex-col h-full overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="flex flex-col gap-1.5 pr-8">
            <div className="flex items-center gap-3 flex-wrap">
              <SheetTitle className="text-xl font-bold">
                {user.businessName || user.name}
              </SheetTitle>
              <Badge variant="outline">{user.role}</Badge>
              {isBusiness && (
                <Badge variant="secondary" className="text-xs">
                  Business
                </Badge>
              )}
            </div>
            {user.businessName && user.businessName !== user.name && (
              <p className="text-sm text-foreground/80 font-medium">
                Contact: {user.name}
              </p>
            )}
            <SheetDescription className="break-all">{user.email}</SheetDescription>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
              Contact Information
            </h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <span className="text-muted-foreground pt-0.5">Email:</span>
              <div className="col-span-2 flex items-center gap-2">
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
                    navigator.clipboard.writeText(user.email)
                    toast.success("Email copied to clipboard.")
                  }}
                >
                  <Copy className="size-3 text-muted-foreground" />
                </Button>
              </div>

              <span className="text-muted-foreground pt-0.5">Mobile:</span>
              <div className="col-span-2">
                {user.mobile ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${user.mobile}`}
                        className="font-mono text-sm font-semibold hover:underline text-foreground inline-flex items-center gap-1.5"
                      >
                        <Phone className="size-3.5 text-muted-foreground shrink-0" />
                        {user.mobile}
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="cursor-pointer shrink-0"
                        title="Copy phone number"
                        onClick={() => {
                          navigator.clipboard.writeText(user.mobile!)
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
                        <a href={`tel:${user.mobile}`}>
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
                          href={getWhatsAppUrl(user.mobile)}
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

              <span className="text-muted-foreground">Suburb:</span>
              <span className="col-span-2 font-medium">{user.suburb || "Linden"}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
              Registration Overview
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">Role:</span>
              <span className="col-span-2">
                <Badge variant="secondary">{user.role}</Badge>
              </span>

              {user.businessName && (
                <>
                  <span className="text-muted-foreground">Business:</span>
                  <span className="col-span-2 font-medium">{user.businessName}</span>
                </>
              )}

              {user.businessAddress && (
                <>
                  <span className="text-muted-foreground">Address:</span>
                  <span className="col-span-2">{user.businessAddress}</span>
                </>
              )}

              <span className="text-muted-foreground">Window Sticker:</span>
              <span className="col-span-2">{user.wantsWindowSticker ? "Yes, requested" : "No"}</span>

              <span className="text-muted-foreground">Status:</span>
              <span className="col-span-2">
                <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                  {user.status === "Active" ? "Claimed / Active" : "Pending Claim"}
                </Badge>
              </span>

              <span className="text-muted-foreground">Submitted:</span>
              <span className="col-span-2">{new Date(user.joinedDate).toLocaleString()}</span>
            </div>
          </div>

          {user.interests && user.interests.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                  Interests & Preferences
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {user.interests.map((interest, i) => (
                    <Badge key={i} variant="outline">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {user.details && Object.keys(user.details).length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                  Additional Details
                </h4>
                <pre className="rounded-md bg-muted p-3 text-xs whitespace-pre-wrap break-words text-muted-foreground">
                  {JSON.stringify(user.details, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
