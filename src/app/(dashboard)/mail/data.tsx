import * as React from "react"
import { HyperlocalLogo } from "@/components/hyperlocal-logo"
import type { MailMessageRow } from "@/lib/mail"

export interface Mail {
  id: string
  name: string
  email: string
  subject: string
  text: string
  date: string
  read: boolean
  labels: string[]
  category?: string
  status?: "unread" | "read" | "replied" | "closed"
  is_starred?: boolean
  is_archived?: boolean
  is_trashed?: boolean
  snoozed_until?: string | null
  registration_id?: string | null
  messages?: MailMessageRow[]
}

export interface Account {
  label: string
  email: string
  icon: React.ReactNode
}

export const accounts: Account[] = [
  {
    label: "Hello Linden Desk",
    email: "registrations@hellohyperlocal.co.za",
    icon: <HyperlocalLogo className="size-4" />,
  },
  {
    label: "Hello Linden Admin",
    email: "admin@hellolinden.co.za",
    icon: <HyperlocalLogo className="size-4" />,
  },
]

export const mails: Mail[] = []
