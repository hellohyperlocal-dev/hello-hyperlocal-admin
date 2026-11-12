"use client"

import { useState, useTransition, useMemo } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
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
  MessageCircle,
  Mail,
  CheckCircle2,
  ArrowUpDown,
  ExternalLink,
  MapPin,
} from "lucide-react"

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
import { InquiryDetailSheet } from "./inquiry-detail-sheet"
import { deleteInquiryAction, updateInquiryStatusAction } from "../actions"
import type {
  CommunityProject,
  CommunityProjectInquiry,
  ContributionType,
  InquiryStatus,
} from "@/lib/community-projects-types"
import { CONTRIBUTION_TYPE_CONFIG } from "@/lib/community-projects-types"

interface InquiriesDataTableProps {
  inquiries: CommunityProjectInquiry[]
  projects: CommunityProject[]
  onStatusChange?: (id: string, newStatus: InquiryStatus) => void
  onDeleteInquiry?: (id: string) => void
}

export function InquiriesDataTable({
  inquiries,
  projects,
  onStatusChange,
  onDeleteInquiry,
}: InquiriesDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const [viewingInquiry, setViewingInquiry] = useState<CommunityProjectInquiry | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [inquiryToDelete, setInquiryToDelete] = useState<CommunityProjectInquiry | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleViewInquiry = (inquiry: CommunityProjectInquiry) => {
    setViewingInquiry(inquiry)
    setSheetOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!inquiryToDelete) return
    const id = inquiryToDelete.id
    const name = inquiryToDelete.resident_name

    startTransition(async () => {
      const res = await deleteInquiryAction(id)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(`Inquiry from "${name}" was deleted.`)
      setDeleteDialogOpen(false)
      setInquiryToDelete(null)
      if (viewingInquiry?.id === id) {
        setSheetOpen(false)
        setViewingInquiry(null)
      }
      onDeleteInquiry?.(id)
    })
  }

  const handleQuickStatusChange = (inquiry: CommunityProjectInquiry, newStatus: InquiryStatus) => {
    startTransition(async () => {
      const res = await updateInquiryStatusAction(inquiry.id, newStatus)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Inquiry updated to ${newStatus}.`)
        onStatusChange?.(inquiry.id, newStatus)
      }
    })
  }

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case "new":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 gap-1.5"
          >
            <span className="size-1.5 rounded-full bg-amber-500" />
            New Lead
          </Badge>
        )
      case "contacted":
        return (
          <Badge
            variant="outline"
            className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 gap-1.5"
          >
            <span className="size-1.5 rounded-full bg-blue-500" />
            Contacted
          </Badge>
        )
      case "connected":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 gap-1.5"
          >
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Connected
          </Badge>
        )
    }
  }

  const columns = useMemo<ColumnDef<CommunityProjectInquiry>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 size-3 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.original.created_at)
          return (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {date.toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )
        },
      },
      {
        accessorKey: "resident_name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Resident
            <ArrowUpDown className="ml-2 size-3 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => {
          const inq = row.original
          return (
            <div className="flex flex-col py-1">
              <span className="text-sm font-semibold text-foreground">{inq.resident_name}</span>
              {inq.street_address && (
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate max-w-[170px]">
                  <MapPin className="size-3 text-primary shrink-0" />
                  {inq.street_address}
                </span>
              )}
            </div>
          )
        },
      },
      {
        id: "contact",
        header: "Contact Channels",
        cell: ({ row }) => {
          const inq = row.original
          const cleanPhone = inq.phone.replace(/[^0-9]/g, "").replace(/^0/, "")
          const waUrl = `https://wa.me/27${cleanPhone}?text=${encodeURIComponent(
            `Hi ${inq.resident_name}, thank you for reaching out regarding the ${inq.project_title} project on Hello Linden!`
          )}`
          const mailUrl = `mailto:${inq.email}?subject=${encodeURIComponent(
            `Hello Linden: ${inq.project_title}`
          )}`

          return (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <Button
                asChild
                size="sm"
                className="h-7 px-2 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1 cursor-pointer"
              >
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-3" />
                  WhatsApp
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[11px] gap-1 cursor-pointer"
              >
                <a href={mailUrl}>
                  <Mail className="size-3" />
                  Email
                </a>
              </Button>
            </div>
          )
        },
      },
      {
        accessorKey: "project_title",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Target Project
            <ArrowUpDown className="ml-2 size-3 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground line-clamp-1 max-w-[200px]">
            {row.original.project_title}
          </span>
        ),
      },
      {
        accessorKey: "contribution_types",
        header: "Offers / Help",
        cell: ({ row }) => {
          const types = row.original.contribution_types
          return (
            <div className="flex flex-wrap gap-1 max-w-[240px]">
              {types.slice(0, 2).map((t) => {
                const cfg = CONTRIBUTION_TYPE_CONFIG[t] || {
                  label: t,
                  badgeClass: "bg-muted text-muted-foreground",
                }
                return (
                  <Badge
                    key={t}
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 font-medium ${cfg.badgeClass}`}
                  >
                    {cfg.label}
                  </Badge>
                )
              })}
              {types.length > 2 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                  +{types.length - 2}
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 size-3 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const inq = row.original
          const cleanPhone = inq.phone.replace(/[^0-9]/g, "").replace(/^0/, "")
          const waUrl = `https://wa.me/27${cleanPhone}?text=${encodeURIComponent(
            `Hi ${inq.resident_name}, thank you for reaching out regarding the ${inq.project_title} project on Hello Linden!`
          )}`
          const mailUrl = `mailto:${inq.email}?subject=${encodeURIComponent(
            `Hello Linden: ${inq.project_title}`
          )}`

          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
                    <EllipsisVertical className="size-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => handleViewInquiry(inq)}
                  >
                    <Eye className="mr-2 size-4 text-muted-foreground" />
                    View Full Details
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <a href={waUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 size-4 text-emerald-600" />
                      Open WhatsApp
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <a href={mailUrl}>
                      <Mail className="mr-2 size-4 text-blue-600" />
                      Send Email
                    </a>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {inq.status !== "connected" && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleQuickStatusChange(inq, "connected")}
                    >
                      <CheckCircle2 className="mr-2 size-4 text-emerald-600" />
                      Mark Connected
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => {
                      setInquiryToDelete(inq)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete Inquiry
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: inquiries,
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
    globalFilterFn: (row, columnId, filterValue) => {
      const i = row.original
      const q = String(filterValue).toLowerCase()
      return (
        i.resident_name.toLowerCase().includes(q) ||
        i.phone.includes(q) ||
        i.email.toLowerCase().includes(q) ||
        Boolean(i.street_address?.toLowerCase().includes(q)) ||
        i.project_title.toLowerCase().includes(q) ||
        Boolean(i.message?.toLowerCase().includes(q))
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

  const projectFilter = (table.getColumn("project_title")?.getFilterValue() as string) ?? ""
  const statusFilter = (table.getColumn("status")?.getFilterValue() as string) ?? ""

  const handleExport = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const rowsToExport = selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows
    const exportData = rowsToExport.map((r) => r.original)

    if (exportData.length === 0) {
      toast.error("No inquiries to export.")
      return
    }

    const csvContent = [
      [
        "ID",
        "Date",
        "Resident Name",
        "Phone",
        "Email",
        "Street Address",
        "Project Title",
        "Offer Types",
        "Status",
        "Message",
      ].join(","),
      ...exportData.map((i) =>
        [
          `"${i.id}"`,
          `"${new Date(i.created_at).toISOString()}"`,
          `"${i.resident_name.replace(/"/g, '""')}"`,
          `"${i.phone}"`,
          `"${i.email}"`,
          `"${(i.street_address || "").replace(/"/g, '""')}"`,
          `"${i.project_title.replace(/"/g, '""')}"`,
          `"${i.contribution_types.join(", ")}"`,
          `"${i.status}"`,
          `"${(i.message || "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute(
      "download",
      `community-project-inquiries-${new Date().toISOString().split("T")[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${exportData.length} inquiries.`)
  }

  return (
    <div className="w-full space-y-4">
      {/* Top Toolbar: Search + Export */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resident, phone, email, project..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(String(e.target.value))}
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

      {/* Filter Row: Project + Status + Column Visibility */}
      <div className="grid gap-2 sm:grid-cols-3 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="inquiry-project-filter" className="text-sm font-medium">
            Project
          </Label>
          <Select
            value={projectFilter || ""}
            onValueChange={(val) =>
              table.getColumn("project_title")?.setFilterValue(val === "all" ? "" : val)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="inquiry-project-filter">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.title}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="inquiry-status-filter" className="text-sm font-medium">
            Status
          </Label>
          <Select
            value={statusFilter || ""}
            onValueChange={(val) =>
              table.getColumn("status")?.setFilterValue(val === "all" ? "" : val)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="inquiry-status-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New Leads</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="connected">Connected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="inquiry-column-visibility" className="text-sm font-medium">
            Column Visibility
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild id="inquiry-column-visibility">
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
                    onCheckedChange={(val) => column.toggleVisibility(!!val)}
                  >
                    {column.id.replace(/_/g, " ")}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* TanStack Table Container */}
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
                  onClick={() => handleViewInquiry(row.original)}
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No resident inquiries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(val) => table.setPageSize(Number(val))}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </span>
            <div className="space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-Over Inquiry Detail Sheet */}
      <InquiryDetailSheet
        inquiry={viewingInquiry}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onStatusChange={onStatusChange}
        onDeleteInquiry={onDeleteInquiry}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the inquiry from{" "}
              <strong>{inquiryToDelete?.resident_name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={pending}
            >
              Delete Inquiry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
