"use client"

import { useState } from "react"
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
import type { UserFormValues } from "./user-form-dialog"
import { RegistrationDetailSheet } from "./registration-detail-sheet"
import { toast } from "sonner"

export interface RegistrationUser {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  rawRole: string
  category: string
  suburb: string
  businessName?: string | null
  businessAddress?: string | null
  mobile?: string | null
  wantsWindowSticker?: boolean
  interests?: string[]
  details?: Record<string, unknown> | null
  status: "Active" | "Pending"
  joinedDate: string
  lastLogin: string
}

interface DataTableProps {
  users: RegistrationUser[]
  onDeleteUser: (id: string) => void
  onEditUser: (user: RegistrationUser) => void
  onAddUser?: (userData: UserFormValues) => void
}

export function DataTable({ users, onDeleteUser, onEditUser, onAddUser }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [viewingUser, setViewingUser] = useState<RegistrationUser | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleViewUser = (user: RegistrationUser) => {
    setViewingUser(user)
    setSheetOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
      case "Pending":
        return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getRoleColor = (role: string) => {
    const r = role.toLowerCase()
    if (r.includes("business")) {
      return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
    }
    if (r.includes("neighbour")) {
      return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
    }
    if (r.includes("partner")) {
      return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20"
    }
    return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20"
  }

  const exactFilter = (row: Row<RegistrationUser>, columnId: string, value: string) => {
    return row.getValue(columnId) === value
  }

  const columns: ColumnDef<RegistrationUser>[] = [
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
      accessorKey: "name",
      header: "User / Business",
      cell: ({ row }) => {
        const user = row.original
        const isBusiness = user.category === "Business" || Boolean(user.businessName)
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs font-medium">
                {user.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-foreground truncate">{user.name}</span>
              {isBusiness && user.businessName && user.businessName !== user.name && (
                <span className="text-xs text-primary font-medium truncate flex items-center gap-1">
                  <Store className="size-3 shrink-0" />
                  {user.businessName}
                </span>
              )}
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "mobile",
      header: "Phone",
      cell: ({ row }) => {
        const mobile = row.original.mobile
        if (!mobile) {
          return <span className="text-xs text-muted-foreground/50 italic">—</span>
        }
        return (
          <a
            href={`tel:${mobile}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground hover:text-primary hover:underline transition-colors group whitespace-nowrap"
            onClick={(e) => e.stopPropagation()}
            title={`Call ${mobile}`}
          >
            <Phone className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
            <span className="font-mono tabular-nums">{mobile}</span>
          </a>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <Badge variant="secondary" className={getRoleColor(role)}>
            {role}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string
        return <span className="font-medium text-sm">{category}</span>
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "suburb",
      header: "Suburb",
      cell: ({ row }) => {
        const suburb = row.getValue("suburb") as string
        return <span className="text-sm">{suburb}</span>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant="secondary" className={getStatusColor(status)}>
            {status}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "joinedDate",
      header: "Joined",
      cell: ({ row }) => {
        const dateStr = row.getValue("joinedDate") as string
        const formatted = dateStr ? new Date(dateStr).toLocaleDateString() : "—"
        return <span className="text-muted-foreground text-xs">{formatted}</span>
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => handleViewUser(user)}
              title="View user"
            >
              <Eye className="size-4" />
              <span className="sr-only">View user</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => onEditUser(user)}
              title="Edit user"
            >
              <Pencil className="size-4" />
              <span className="sr-only">Edit user</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                  <EllipsisVertical className="size-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleViewUser(user)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(user.email)
                    toast.success("Email copied to clipboard.")
                  }}
                >
                  Copy Email
                </DropdownMenuItem>
                {user.mobile && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(user.mobile!)
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
                  onClick={() => onDeleteUser(user.id)}
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
        u.name,
        u.email,
        u.mobile,
        u.businessName,
        u.role,
        u.category,
        u.suburb,
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
  const categoryFilter = table.getColumn("category")?.getFilterValue() as string
  const statusFilter = table.getColumn("status")?.getFilterValue() as string

  const handleExport = () => {
    toast.info("Preparing export…")
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const rowsToExport = selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows
    const exportData = rowsToExport.map((r) => r.original)

    if (exportData.length === 0) {
      toast.error("No rows to export.")
      return
    }

    const headers = [
      "ID",
      "Name",
      "Business Name",
      "Email",
      "Phone",
      "Role",
      "Category",
      "Suburb",
      "Status",
      "Joined",
    ]
    const csvContent = [
      headers.join(","),
      ...exportData.map((u) =>
        [
          `"${u.id}"`,
          `"${(u.name || "").replace(/"/g, '""')}"`,
          `"${(u.businessName || "").replace(/"/g, '""')}"`,
          `"${(u.email || "").replace(/"/g, '""')}"`,
          `"${(u.mobile || "").replace(/"/g, '""')}"`,
          `"${(u.role || "").replace(/"/g, '""')}"`,
          `"${(u.category || "").replace(/"/g, '""')}"`,
          `"${(u.suburb || "").replace(/"/g, '""')}"`,
          `"${(u.status || "").replace(/"/g, '""')}"`,
          `"${(u.joinedDate || "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `registrations-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${exportData.length} records.`)
  }

  return (
    <div className="w-full space-y-4">
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
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-4 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="role-filter" className="text-sm font-medium">
            Role
          </Label>
          <Select
            value={roleFilter || ""}
            onValueChange={(value) =>
              table.getColumn("role")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="role-filter">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Founding Neighbour">Founding Neighbour</SelectItem>
              <SelectItem value="Founding Business">Founding Business</SelectItem>
              <SelectItem value="Partner Interest">Partner Interest</SelectItem>
              <SelectItem value="General Enquiry">General Enquiry</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category-filter" className="text-sm font-medium">
            Category
          </Label>
          <Select
            value={categoryFilter || ""}
            onValueChange={(value) =>
              table.getColumn("category")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="category-filter">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Resident">Resident</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Partner">Partner</SelectItem>
              <SelectItem value="General Enquiry">General Enquiry</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status-filter" className="text-sm font-medium">
            Status
          </Label>
          <Select
            value={statusFilter || ""}
            onValueChange={(value) =>
              table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="status-filter">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active (Claimed)</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="column-visibility" className="text-sm font-medium">
            Column Visibility
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild id="column-visibility">
              <Button variant="outline" className="cursor-pointer w-full">
                Columns <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="page-size" className="text-sm font-medium">
            Show
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
              {table.getPageCount()}
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

      <RegistrationDetailSheet
        user={viewingUser}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}
