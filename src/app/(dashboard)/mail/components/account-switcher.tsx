"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Account } from "../data"

export type AccountOption = Account;

interface AccountSwitcherProps {
  isCollapsed: boolean;
  accounts: Account[];
  selectedEmail?: string;
  onSelectAccount?: (account: Account) => void;
}

export function AccountSwitcher({
  isCollapsed,
  accounts,
  selectedEmail,
  onSelectAccount,
}: AccountSwitcherProps) {
  const currentEmail = selectedEmail || accounts[0]?.email || "";

  const handleValueChange = (email: string) => {
    const acc = accounts.find((a) => a.email === email);
    if (acc && onSelectAccount) {
      onSelectAccount(acc);
    }
  };

  const currentAccount = accounts.find((account) => account.email === currentEmail) || accounts[0];

  return (
    <Select value={currentEmail} onValueChange={handleValueChange}>
      <SelectTrigger
        className={cn(
          "flex items-center gap-2 w-full cursor-pointer",
          isCollapsed &&
            "flex size-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
        )}
        aria-label="Select account"
      >
        <SelectValue placeholder="Select an account">
          {currentAccount?.icon}
          <span className={cn("ml-2 font-medium text-xs truncate", isCollapsed && "hidden")}>
            {currentAccount?.label}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" className="w-full">
        {accounts.map((account) => (
          <SelectItem key={account.email} value={account.email} className="cursor-pointer">
            <div className="flex items-center gap-3 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
              {account.icon}
              <div className="flex flex-col text-left">
                <span className="font-medium text-xs leading-none">{account.label}</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">{account.email}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
