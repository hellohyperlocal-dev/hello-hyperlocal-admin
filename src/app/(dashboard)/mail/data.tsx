import * as React from "react"
import { HyperlocalLogo } from "@/components/hyperlocal-logo"

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
}

export const accounts = [
  {
    label: "Hello Linden",
    email: "registrations@hellohyperlocal.co.za",
    icon: <HyperlocalLogo className="size-4" />,
  },
  {
    label: "Hello Linden Admin",
    email: "admin@hellolinden.co.za",
    icon: <HyperlocalLogo className="size-4" />,
  },
]

export type Account = (typeof accounts)[number]

export const mails: Mail[] = []
