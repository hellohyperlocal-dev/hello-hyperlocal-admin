"use client"

import { useState, useTransition, useMemo } from "react"
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
  Plus,
  Star,
  MapPin,
  Power,
  Store,
  Phone,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { CreateListingDialog } from "../create-listing-dialog"
import { ListingDetailSheet } from "../listing-detail-sheet"
import { deleteBusiness, toggleBusinessOpen } from "../actions"
import type { BusinessRow } from "@/lib/listings-types"

interface BusinessDataTableProps {
  businesses: BusinessRow[]
  onToggleStatus?: (id: string, isOpen: boolean) => void
  onDelete?: (id: string) => void
}

export function BusinessDataTable({
  businesses,
  onToggleStatus,
  onDelete,
}: BusinessDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const [viewingBusiness, setViewingBusiness] = useState<BusinessRow | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [businessToDelete, setBusinessToDelete] = useState<BusinessRow | null>(null)
  const [pending, startTransition] = useTransition()

  // Distinct categories for filter dropdown
  const categories = useMemo(() => {
    const set = new Set<string>()
    businesses.forEach((b) => {
      if (b.category) set.add(b.category)
    })
    return Array.from(set).sort()
  }, [businesses])

  const handleView = (b: BusinessRow) => {
    setViewingBusiness(b)
    setSheetOpen(true)
  }

  const handleToggle = (b: BusinessRow) => {
    const next = !b.is_open
    if (onToggleStatus) {
      onToggleStatus(b.id, next)
    }
    startTransition(async () => {
      const res = await toggleBusinessOpen(b.id, next)
      if (res.error) {
        toast.error(res.error)
        // revert if parent provided handler
        if (onToggleStatus) onToggleStatus(b.id, !next)
        return
      }
      toast.success(`"${b.name}" is now marked as ${next ? "Open" : "Closed"}.`)
    })
  }

  const handleDeleteConfirm = () => {
    if (!businessToDelete) return
    const id = businessToDelete.id
    const name = businessToDelete.name

    if (onDelete) {
      onDelete(id)
    }

    startTransition(async () => {
      const res = await deleteBusiness(id)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(`"${name}" has been deleted.`)
      setBusinessToDelete(null)
      if (viewingBusiness?.id === id) {
        setSheetOpen(false)
      }
    })
  }

  const exactFilter = (row: Row<BusinessRow>, columnId: string, value: string) => {
    return row.getValue(columnId) === value
  }

  const columns: ColumnDef<BusinessRow>[] = [
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
      size: 40,
    },
    {
      accessorKey: "name",
      header: "Business",
      cell: ({ row }) => {
        const b = row.original
        const initials = b.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()

        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <Avatar className="size-9 shrink-0">
              {b.image_url && <AvatarImage src={b.image_url} alt={b.name} />}
              <AvatarFallback className="text-xs font-semibold">
                {initials || <Store className="size-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <button
                type="button"
                onClick={() => handleView(b)}
                className="font-medium text-left truncate text-foreground hover:underline cursor-pointer"
              >
                {b.name}
              </button>
              {b.address && (
                <span className="text-xs text-muted-foreground flex items-center gap-1 truncate max-w-[240px]">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{b.address}</span>
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string
        return (
          <Badge variant="outline" className="font-normal text-xs">
            {category || "Uncategorized"}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.original.phone
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
      accessorKey: "hours",
      header: "Hours",
      cell: ({ row }) => {
        const hours = row.getValue("hours") as string | null
        return (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {hours || "—"}
          </span>
        )
      },
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => {
        const b = row.original
        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Star className="size-3.5 fill-amber-500 text-amber-500 shrink-0" />
            <span className="text-sm font-medium">{b.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">
              ({b.review_count})
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "is_open",
      header: "Status",
      cell: ({ row }) => {
        const b = row.original
        return (
          <button
            type="button"
            onClick={() => handleToggle(b)}
            disabled={pending}
            className="cursor-pointer rounded focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            title="Click to toggle Open / Closed"
          >
            <Badge
              variant={b.is_open ? "secondary" : "outline"}
              className={`text-xs font-medium cursor-pointer transition-all ${
                b.is_open
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-200"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Power className="mr-1 size-3" />
              {b.is_open ? "Open" : "Closed"}
            </Badge>
          </button>
        )
      },
      filterFn: (row, columnId, value) => {
        if (value === "open") return row.getValue(columnId) === true
        if (value === "closed") return row.getValue(columnId) === false
        return true
      },
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => {
        const dateStr = row.getValue("created_at") as string
        const formatted = dateStr ? new Date(dateStr).toLocaleDateString() : "—"
        return <span className="text-muted-foreground text-xs">{formatted}</span>
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const b = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => handleView(b)}
              title="View details"
            >
              <Eye className="size-4" />
              <span className="sr-only">View details</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              asChild
              title="Edit business"
            >
              <Link href={`/listings/business/${b.id}`}>
                <Pencil className="size-4" />
                <span className="sr-only">Edit business</span>
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                  <EllipsisVertical className="size-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleView(b)}>
                  <Eye className="mr-2 size-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={`/listings/business/${b.id}`}>
                    <Pencil className="mr-2 size-4" />
                    Edit Business
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleToggle(b)}>
                  <Power className="mr-2 size-4" />
                  Mark as {b.is_open ? "Closed" : "Open"}
                </DropdownMenuItem>
                {b.phone && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(b.phone!)
                      toast.success("Phone number copied to clipboard.")
                    }}
                  >
                    <Phone className="mr-2 size-4" />
                    Copy Phone
                  </DropdownMenuItem>
                )}
                {b.address && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(b.address!)
                      toast.success("Business address copied to clipboard.")
                    }}
                  >
                    <MapPin className="mr-2 size-4" />
                    Copy Address
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  onClick={() => setBusinessToDelete(b)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete Business
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: businesses,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = (filterValue || "").toLowerCase().trim()
      if (!search) return true
      const name = (row.original.name || "").toLowerCase()
      const category = (row.original.category || "").toLowerCase()
      const address = (row.original.address || "").toLowerCase()
      const desc = (row.original.description || "").toLowerCase()
      const phone = (row.original.phone || "").toLowerCase()
      return (
        name.includes(search) ||
        category.includes(search) ||
        address.includes(search) ||
        desc.includes(search) ||
        phone.includes(search)
      )
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  const categoryFilter = table.getColumn("category")?.getFilterValue() as string
  const statusFilter = table.getColumn("is_open")?.getFilterValue() as string

  const handleExport = () => {
    toast.info("Preparing export…")
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const rowsToExport =
      selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows
    const exportData = rowsToExport.map((r) => r.original)

    if (exportData.length === 0) {
      toast.error("No businesses to export.")
      return
    }

    const headers = [
      "ID",
      "Name",
      "Category",
      "Phone",
      "Address",
      "Rating",
      "Review Count",
      "Hours",
      "Status",
      "Joined Date",
    ]
    const csvContent = [
      headers.join(","),
      ...exportData.map((b) =>
        [
          `"${b.id}"`,
          `"${(b.name || "").replace(/"/g, '""')}"`,
          `"${(b.category || "").replace(/"/g, '""')}"`,
          `"${(b.phone || "").replace(/"/g, '""')}"`,
          `"${(b.address || "").replace(/"/g, '""')}"`,
          `"${b.rating.toFixed(1)}"`,
          `"${b.review_count}"`,
          `"${(b.hours || "").replace(/"/g, '""')}"`,
          `"${b.is_open ? "Open" : "Closed"}"`,
          `"${(b.created_at || "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute(
      "download",
      `businesses-${new Date().toISOString().split("T")[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${exportData.length} business records.`)
  }

  return (
    <div className="w-full space-y-4">
      {/* Top Toolbar: Search + Export + Add Business */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search businesses, category, address..."
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
          <CreateListingDialog
            defaultTab="business"
            trigger={
              <Button size="sm" className="gap-2 cursor-pointer">
                <Plus className="size-4" /> Add Business
              </Button>
            }
          />
        </div>
      </div>

      {/* Filter Row: Category + Operating Status + Column Visibility */}
      <div className="grid gap-2 sm:grid-cols-3 sm:gap-4">
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
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status-filter" className="text-sm font-medium">
            Operating Status
          </Label>
          <Select
            value={statusFilter || ""}
            onValueChange={(value) =>
              table.getColumn("is_open")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="status-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open Now</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
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
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id === "is_open"
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
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-muted-foreground"
                >
                  No businesses found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
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

      {/* Slide-out Detail Drawer */}
      <ListingDetailSheet
        item={viewingBusiness ? { type: "business", data: viewingBusiness } : null}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={businessToDelete !== null}
        onOpenChange={(open) => !open && setBusinessToDelete(null)}
      >
        <AlertDialogContent className="w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <strong>&quot;{businessToDelete?.name}&quot;</strong>? This will remove it
              from the Hello Linden mobile app directory. This action cannot be undone.
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
              {pending ? "Deleting..." : "Yes, Delete Business"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
