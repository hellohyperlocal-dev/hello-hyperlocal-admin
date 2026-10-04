"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { RegistrationUser } from "./data-table"

interface RegistrationDetailSheetProps {
  user: RegistrationUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegistrationDetailSheet({
  user,
  open,
  onOpenChange,
}: RegistrationDetailSheetProps) {
  if (!user) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <SheetTitle className="text-xl">{user.name}</SheetTitle>
            <Badge variant="outline">{user.role}</Badge>
          </div>
          <SheetDescription>{user.email}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6 text-sm">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
              Contact Information
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">Email:</span>
              <span className="col-span-2 font-medium">{user.email}</span>

              <span className="text-muted-foreground">Mobile:</span>
              <span className="col-span-2">{user.mobile || "Not provided"}</span>

              <span className="text-muted-foreground">Suburb:</span>
              <span className="col-span-2">{user.suburb || "Linden"}</span>
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
