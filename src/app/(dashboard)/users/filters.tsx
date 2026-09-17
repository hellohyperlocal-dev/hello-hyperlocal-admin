"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROLES = [
  { value: "all", label: "All roles" },
  { value: "resident", label: "Resident" },
  { value: "business", label: "Business" },
  { value: "councillor", label: "Councillor" },
  { value: "admin", label: "Admin" },
];

export function UserFilters({ role, search }: { role: string; search: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(search);

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(next)) {
      if (val && val !== "all") params.set(key, val);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`/users?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <form
        className="w-full max-w-xs"
        onSubmit={(e) => {
          e.preventDefault();
          updateParams({ q: value });
        }}
      >
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search name, business, phone…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </InputGroup>
      </form>
      <Select value={role} onValueChange={(v) => v && updateParams({ role: v })}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
