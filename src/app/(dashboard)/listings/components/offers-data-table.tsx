"use client"

import { useState, useTransition, useMemo } from "react"
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
  Trash2,
  Download,
  Search,
  Plus,
  Ban,
  Tag,
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
import { deleteListing, unpublishListing } from "../actions"
import type { LoveLocalOfferRow } from "@/lib/listings-types"

interface OffersDataTableProps {
  offers: LoveLocalOfferRow[]
  onDelete?: (id: string) => void
  onUnpublish?: (id: string) => void
}

export function OffersDataTable({
  offers,
  onDelete,
  onUnpublish,
}: OffersDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const [viewingOffer, setViewingOffer] = useState<LoveLocalOfferRow | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<LoveLocalOfferRow | null>(null)
  const [pending, startTransition] = useTransition()

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>()
    offers.forEach((o) => {
      if (o.category) set.add(o.category)
    })
    return Array.from(set).sort()
  }, [offers])

  const handleView = (item: LoveLocalOfferRow) => {
    setViewingOffer(item)
    setSheetOpen(true)
  }

  const handleUnpublish = (item: LoveLocalOfferRow) => {
    if (onUnpublish) onUnpublish(item.id)
    startTransition(async () => {
      const res = await unpublishListing("love_local_offers", item.id)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(`"${item.title}" unpublished.`)
    })
  }

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return
    const id = itemToDelete.id
    const title = itemToDelete.title

    if (onDelete) onDelete(id)

    startTransition(async () => {
      const res = await deleteListing("love_local_offers", id)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(`"${title}" has been deleted.`)
      setItemToDelete(null)
      if (viewingOffer?.id === id) {
        setSheetOpen(false)
      }
    })
  }

  const exactFilter = (row: Row<LoveLocalOfferRow>, columnId: string, value: string) => {
    return row.getValue(columnId) === value
  }

  const columns: ColumnDef<LoveLocalOfferRow>[] = [
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
      accessorKey: "title",
      header: "Offer",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <Avatar className="size-9 shrink-0">
              {item.image_url && <AvatarImage src={item.image_url} alt={item.title} />}
              <AvatarFallback className="text-xs font-semibold">
                <Tag className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <button
                type="button"
                onClick={() => handleView(item)}
                className="font-medium text-left truncate text-foreground hover:underline cursor-pointer"
              >
                {item.title}
              </button>
              {item.description && (
                <span className="text-xs text-muted-foreground truncate max-w-[240px]">
                  {item.description}
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
      accessorKey: "price",
      header: "Price / Deal",
      cell: ({ row }) => {
        const item = row.original
        const price = item.offer_price || item.price
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-foreground">
              {price || "—"}
            </span>
            {item.discount && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0 font-medium">
                {item.discount}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "expires_in",
      header: "Expires",
      cell: ({ row }) => {
        const exp = row.getValue("expires_in") as string | null
        return (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {exp || "Ongoing"}
          </span>
        )
      },
    },
    {
      accessorKey: "moderation_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("moderation_status") as string
        return (
          <Badge
            variant={
              status === "approved"
                ? "secondary"
                : status === "rejected"
                ? "outline"
                : "default"
            }
            className="capitalize text-xs font-medium"
          >
            {status}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "created_at",
      header: "Date",
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
        const item = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => handleView(item)}
              title="View details"
            >
              <Eye className="size-4" />
              <span className="sr-only">View details</span>
            </Button>
            {item.moderation_status !== "rejected" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => handleUnpublish(item)}
                disabled={pending}
                title="Unpublish"
              >
                <Ban className="size-4" />
                <span className="sr-only">Unpublish</span>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                  <EllipsisVertical className="size-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleView(item)}>
                  <Eye className="mr-2 size-4" />
                  View Details
                </DropdownMenuItem>
                {item.moderation_status !== "rejected" && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => handleUnpublish(item)}
                  >
                    <Ban className="mr-2 size-4" />
                    Unpublish
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  onClick={() => setItemToDelete(item)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete Offer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: offers,
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
      const search = filterValue.toLowerCase()
      const title = (row.original.title || "").toLowerCase()
      const category = (row.original.category || "").toLowerCase()
      const desc = (row.original.description || "").toLowerCase()
      return (
        title.includes(search) ||
        category.includes(search) ||
        desc.includes(search)
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
  const statusFilter = table.getColumn("moderation_status")?.getFilterValue() as string

  const handleExport = () => {
    toast.info("Preparing export…")
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const rowsToExport =
      selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows
    const exportData = rowsToExport.map((r) => r.original)

    if (exportData.length === 0) {
      toast.error("No offers to export.")
      return
    }

    const headers = [
      "ID",
      "Title",
      "Category",
      "Price",
      "Offer Price",
      "Discount",
      "Expires",
      "Status",
      "Created At",
    ]
    const csvContent = [
      headers.join(","),
      ...exportData.map((o) =>
        [
          `"${o.id}"`,
          `"${(o.title || "").replace(/"/g, '""')}"`,
          `"${(o.category || "").replace(/"/g, '""')}"`,
          `"${(o.price || "").replace(/"/g, '""')}"`,
          `"${(o.offer_price || "").replace(/"/g, '""')}"`,
          `"${(o.discount || "").replace(/"/g, '""')}"`,
          `"${(o.expires_in || "").replace(/"/g, '""')}"`,
          `"${o.moderation_status}"`,
          `"${o.created_at || ""}"`,
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute(
      "download",
      `love-local-offers-${new Date().toISOString().split("T")[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${exportData.length} records.`)
  }

  return (
    <div className="w-full space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search special offers..."
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
            defaultTab="offer"
            trigger={
              <Button size="sm" className="gap-2 cursor-pointer">
                <Plus className="size-4" /> Add Special Offer
              </Button>
            }
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid gap-2 sm:grid-cols-3 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="offer-category-filter" className="text-sm font-medium">
            Category
          </Label>
          <Select
            value={categoryFilter || ""}
            onValueChange={(value) =>
              table.getColumn("category")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="offer-category-filter">
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
          <Label htmlFor="offer-status-filter" className="text-sm font-medium">
            Moderation Status
          </Label>
          <Select
            value={statusFilter || ""}
            onValueChange={(value) =>
              table
                .getColumn("moderation_status")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="offer-status-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="offer-column-visibility" className="text-sm font-medium">
            Column Visibility
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild id="offer-column-visibility">
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
                    {column.id === "moderation_status"
                      ? "Status"
                      : column.id === "created_at"
                      ? "Date"
                      : column.id === "expires_in"
                      ? "Expires"
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
                  No special offers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="offer-page-size" className="text-sm font-medium">
            Show
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="w-20 cursor-pointer" id="offer-page-size">
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

      {/* Slide-out Drawer */}
      <ListingDetailSheet
        item={viewingOffer ? { type: "offer", data: viewingOffer } : null}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent className="w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Special Offer?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <strong>&quot;{itemToDelete?.title}&quot;</strong>? This action cannot be
              undone.
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
              {pending ? "Deleting..." : "Yes, Delete Offer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
