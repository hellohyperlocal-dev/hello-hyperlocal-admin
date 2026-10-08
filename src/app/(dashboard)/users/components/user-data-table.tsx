"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDown,
  EllipsisVertical,
  Eye,
  Pencil,
  Trash2,
  Download,
  Search,
  Phone,
  Store,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Clock,
  Mail,
  UserPlus,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { AddUserDialog } from "../add-user-dialog"
import { UserDetailSheet } from "./user-detail-sheet"
import { suspendUser, unsuspendUser, deleteUser } from "../actions"
import type { UserRow } from "@/lib/users"

interface UserDataTableProps {
  users: UserRow[]
  onDeleteUser?: (id: string) => void
  onUpdateUser?: (user: UserRow) => void
  onUserAdded?: () => void
}

function exactFilter(
  row: Row<UserRow>,
  columnId: string,
  filterValue: string
) {
  if (!filterValue || filterValue === "all") return true
  const value = String(row.getValue(columnId) || "").toLowerCase()
  return value === filterValue.toLowerCase()
}

function generateAvatar(name: string) {
  const parts = name.trim().split(" ").filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase() || "U"
}

export function UserDataTable({
  users,
  onDeleteUser,
  onUpdateUser,
  onUserAdded,
}: UserDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [viewingUser, setViewingUser] = useState<UserRow | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserRow | null>(null)
  const [pending, startTransition] = useTransition()

  const handleViewUser = (user: UserRow) => {
    setViewingUser(user)
    setSheetOpen(true)
  }

  const handleToggleSuspend = (user: UserRow) => {
    startTransition(async () => {
      if (user.is_suspended) {
        const res = await unsuspendUser(user.id)
        if (res.error) {
          toast.error(res.error)
          return
        }
        toast.success(`"${user.full_name || user.business_name || "User"}" has been activated.`)
        onUpdateUser?.({
          ...user,
          is_suspended: false,
          suspended_at: null,
          suspended_reason: null,
        })
      } else {
        const res = await suspendUser(user.id, "Administrative suspension")
        if (res.error) {
          toast.error(res.error)
          return
        }
        toast.success(`"${user.full_name || user.business_name || "User"}" has been suspended.`)
        onUpdateUser?.({
          ...user,
          is_suspended: true,
          suspended_at: new Date().toISOString(),
          suspended_reason: "Administrative suspension",
        })
      }
    })
  }

  const handleDeleteConfirm = () => {
    if (!userToDelete) return
    const id = userToDelete.id
    const name = userToDelete.full_name || userToDelete.business_name || "User"

    startTransition(async () => {
      const res = await deleteUser(id)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(`"${name}" was deleted.`)
      setUserToDelete(null)
      onDeleteUser?.(id)
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "business":
        return "text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30 border-blue-200"
      case "resident":
        return "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30 border-emerald-200"
      case "councillor":
        return "text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30 border-purple-200"
      case "admin":
      case "staff":
        return "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30 border-amber-200"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const columns: ColumnDef<UserRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: "full_name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original
        const displayName = user.full_name || user.business_name || "Unnamed User"
        const isBusiness = user.role === "business" || Boolean(user.business_name)

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs font-medium">
                {generateAvatar(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <button
                type="button"
                onClick={() => handleViewUser(user)}
                className="font-medium text-left truncate text-foreground hover:underline cursor-pointer"
              >
                {displayName}
              </button>
              {isBusiness && user.business_name && user.business_name !== user.full_name && (
                <span className="text-xs text-primary font-medium truncate flex items-center gap-1">
                  <Store className="size-3 shrink-0" />
                  {user.business_name}
                </span>
              )}
              <span className="text-xs text-muted-foreground truncate">
                {user.email || user.street_address || "No contact info"}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <Badge variant="outline" className={`capitalize font-medium text-xs ${getRoleBadgeColor(role)}`}>
            {role}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "ward",
      header: "Ward",
      cell: ({ row }) => {
        const ward = row.getValue("ward") as string | null
        return <span className="text-sm font-medium">{ward || "Ward 87"}</span>
      },
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.original.phone_number
        if (!phone) {
          return <span className="text-xs text-muted-foreground/50 italic">—</span>
        }
        return (
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground hover:text-primary hover:underline transition-colors group whitespace-nowrap"
            onClick={(e) => e.stopPropagation()}
            title={`Call ${phone}`}
          >
            <Phone className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
            <span className="font-mono tabular-nums">{phone}</span>
          </a>
        )
      },
    },
    {
      accessorKey: "is_suspended",
      header: "Status",
      cell: ({ row }) => {
        const isSuspended = row.original.is_suspended
        return (
          <Badge
            variant={isSuspended ? "destructive" : "secondary"}
            className="text-xs font-medium"
          >
            {isSuspended ? "Suspended" : "Active"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at") as string)
        return (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {date.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const user = row.original
        const displayName = user.full_name || user.business_name || "User"

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 cursor-pointer"
              onClick={() => handleViewUser(user)}
              title="View details"
            >
              <Eye className="size-4" />
              <span className="sr-only">View</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 cursor-pointer"
              asChild
              title="Edit profile"
            >
              <Link href={`/users/${user.id}`}>
                <Pencil className="size-4" />
                <span className="sr-only">Edit</span>
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
                  <EllipsisVertical className="size-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleViewUser(user)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={`/users/${user.id}`}>
                    <Pencil className="mr-2 size-4" />
                    Full Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleToggleSuspend(user)}
                >
                  {user.is_suspended ? (
                    <>
                      <ShieldCheck className="mr-2 size-4 text-emerald-600" />
                      Unsuspend User
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="mr-2 size-4 text-orange-600" />
                      Suspend User
                    </>
                  )}
                </DropdownMenuItem>
                {user.email && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(user.email!)
                      toast.success("Email copied to clipboard.")
                    }}
                  >
                    <Mail className="mr-2 size-4" />
                    Copy Email
                  </DropdownMenuItem>
                )}
                {user.phone_number && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(user.phone_number!)
                      toast.success("Phone number copied to clipboard.")
                    }}
                  >
                    <Phone className="mr-2 size-4" />
                    Copy Phone
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => setUserToDelete(user)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const search = (filterValue || "").toLowerCase().trim()
      if (!search) return true
      const u = row.original
      const fields = [
        u.full_name,
        u.business_name,
        u.email,
        u.phone_number,
        u.role,
        u.ward,
        u.street_address,
      ]
      return fields.some((field) => field && field.toLowerCase().includes(search))
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  const roleFilter = table.getColumn("role")?.getFilterValue() as string

  const handleExport = () => {
    toast.info("Preparing export…")
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const rowsToExport = selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows
    const exportData = rowsToExport.map((r) => r.original)

    if (exportData.length === 0) {
      toast.error("No users to export.")
      return
    }

    const headers = [
      "ID",
      "Full Name",
      "Business Name",
      "Email",
      "Phone",
      "Role",
      "Ward",
      "Street Address",
      "Status",
      "Joined Date",
    ]
    const csvContent = [
      headers.join(","),
      ...exportData.map((u) =>
        [
          `"${u.id}"`,
          `"${(u.full_name || "").replace(/"/g, '""')}"`,
          `"${(u.business_name || "").replace(/"/g, '""')}"`,
          `"${(u.email || "").replace(/"/g, '""')}"`,
          `"${(u.phone_number || "").replace(/"/g, '""')}"`,
          `"${(u.role || "").replace(/"/g, '""')}"`,
          `"${(u.ward || "").replace(/"/g, '""')}"`,
          `"${(u.street_address || "").replace(/"/g, '""')}"`,
          `"${u.is_suspended ? "Suspended" : "Active"}"`,
          `"${(u.created_at || "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `users-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${exportData.length} records.`)
  }

  return (
    <div className="w-full space-y-4">
      {/* Top action bar: Search, Export, Add New User */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="cursor-pointer" onClick={handleExport}>
            <Download className="mr-2 size-4" />
            Export
          </Button>
          <AddUserDialog onSuccess={onUserAdded} />
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid gap-2 sm:grid-cols-3 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="user-role-filter" className="text-sm font-medium">
            Role
          </Label>
          <Select
            value={roleFilter || ""}
            onValueChange={(value) =>
              table.getColumn("role")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="user-role-filter">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="resident">Resident</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="councillor">Councillor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-status-filter" className="text-sm font-medium">
            Status
          </Label>
          <Select
            onValueChange={(value) => {
              if (value === "all") {
                table.getColumn("is_suspended")?.setFilterValue(undefined)
              } else if (value === "active") {
                table.getColumn("is_suspended")?.setFilterValue(false)
              } else if (value === "suspended") {
                table.getColumn("is_suspended")?.setFilterValue(true)
              }
            }}
          >
            <SelectTrigger className="cursor-pointer w-full" id="user-status-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="column-visibility" className="text-sm font-medium">
            Column Visibility
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between cursor-pointer"
                id="column-visibility"
              >
                <span>Columns</span>
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize cursor-pointer"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id === "full_name"
                      ? "User"
                      : column.id === "phone_number"
                      ? "Phone"
                      : column.id === "is_suspended"
                      ? "Status"
                      : column.id === "created_at"
                      ? "Joined"
                      : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleViewUser(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={(e) => {
                        if (cell.column.id === "select" || cell.column.id === "actions") {
                          e.stopPropagation()
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No users match your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor="page-size" className="text-sm font-medium">
            Rows per page:
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="w-20 cursor-pointer" id="page-size">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 text-sm text-muted-foreground hidden sm:block">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2 hidden sm:block">
            <p className="text-sm font-medium">Page</p>
            <strong className="text-sm">
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount() || 1}
            </strong>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Slide-out detail drawer */}
      <UserDetailSheet
        user={viewingUser}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUserUpdated={onUpdateUser}
        onUserDeleted={onDeleteUser}
      />

      {/* Delete User Modal */}
      <AlertDialog open={Boolean(userToDelete)} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;
              {userToDelete?.full_name || userToDelete?.business_name || "this user"}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              disabled={pending}
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
            >
              {pending ? "Deleting…" : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
