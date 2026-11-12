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
  Pencil,
  Trash2,
  Download,
  Search,
  Plus,
  HeartHandshake,
  Users,
  MessageSquare,
  ArrowUpDown,
  Layers,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
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
import { ProjectFormDialog } from "./project-form-dialog"
import { ProjectDetailSheet } from "./project-detail-sheet"
import { deleteProjectAction, updateProjectAction } from "../actions"
import type {
  CommunityProject,
  CommunityProjectInquiry,
  InquiryStatus,
  ProjectStatus,
} from "@/lib/community-projects-types"
import { PROJECT_CATEGORIES } from "@/lib/community-projects-types"

interface ProjectDataTableProps {
  projects: CommunityProject[]
  inquiries: CommunityProjectInquiry[]
  onUpdateProject?: () => void
  onDeleteProject?: (id: string) => void
  onInquiryStatusChange?: (inquiryId: string, status: InquiryStatus) => void
}

export function ProjectDataTable({
  projects,
  inquiries,
  onUpdateProject,
  onDeleteProject,
  onInquiryStatusChange,
}: ProjectDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const [viewingProject, setViewingProject] = useState<CommunityProject | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<CommunityProject | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<CommunityProject | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  // Inquiries count map per project
  const inquiryCountMap = useMemo(() => {
    const map: Record<string, { total: number; newCount: number }> = {}
    for (const inq of inquiries) {
      if (inq.project_id) {
        if (!map[inq.project_id]) map[inq.project_id] = { total: 0, newCount: 0 }
        map[inq.project_id].total += 1
        if (inq.status === "new") map[inq.project_id].newCount += 1
      }
    }
    return map
  }, [inquiries])

  const handleViewProject = (project: CommunityProject) => {
    setViewingProject(project)
    setSheetOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!projectToDelete) return
    const id = projectToDelete.id
    const title = projectToDelete.title

    startTransition(async () => {
      const res = await deleteProjectAction(id)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(`"${title}" was deleted.`)
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
      if (viewingProject?.id === id) {
        setSheetOpen(false)
        setViewingProject(null)
      }
      onDeleteProject?.(id)
    })
  }

  const handleQuickStatusChange = (project: CommunityProject, newStatus: ProjectStatus) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("title", project.title)
      formData.set("category", project.category)
      formData.set("organizer_name", project.organizer_name)
      formData.set("target_amount", String(project.target_amount))
      formData.set("current_amount_raised", String(project.current_amount_raised))
      formData.set("status", newStatus)
      formData.set("deadline", project.deadline || "")
      formData.set("image_url", project.image_url || "")
      formData.set("description", project.description)

      const res = await updateProjectAction(project.id, formData)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`"${project.title}" marked as ${newStatus}.`)
        onUpdateProject?.()
      }
    })
  }

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 gap-1.5"
          >
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Active
          </Badge>
        )
      case "funded":
        return (
          <Badge
            variant="outline"
            className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 gap-1.5"
          >
            <span className="size-1.5 rounded-full bg-blue-500" />
            100% Funded
          </Badge>
        )
      case "completed":
        return (
          <Badge
            variant="outline"
            className="border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400 gap-1.5"
          >
            <span className="size-1.5 rounded-full bg-slate-500" />
            Completed
          </Badge>
        )
    }
  }

  const getCategoryBadge = (category: string) => {
    const config = PROJECT_CATEGORIES.find(
      (c) => c.value.toLowerCase() === category.toLowerCase()
    )
    const color = config?.color || "bg-muted text-muted-foreground border-border"
    return (
      <Badge variant="outline" className={`text-xs font-normal ${color}`}>
        {category}
      </Badge>
    )
  }

  const columns = useMemo<ColumnDef<CommunityProject>[]>(
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
        accessorKey: "title",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Project
            <ArrowUpDown className="ml-2 size-3 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => {
          const project = row.original
          return (
            <div className="flex items-center gap-3 py-1">
              <div className="size-10 rounded-lg overflow-hidden border bg-muted shrink-0">
                {project.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center bg-primary/10 text-primary">
                    <HeartHandshake className="size-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 max-w-[280px]">
                <p className="font-semibold text-foreground truncate text-sm">
                  {project.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  By {project.organizer_name}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Category
            <ArrowUpDown className="ml-2 size-3 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => getCategoryBadge(row.original.category),
      },
      {
        accessorKey: "current_amount_raised",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Funding Progress
            <ArrowUpDown className="ml-2 size-3 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => {
          const p = row.original
          const percent = Math.min(
            100,
            Math.round((p.current_amount_raised / (p.target_amount || 1)) * 100)
          )
          return (
            <div className="w-[180px] space-y-1.5 py-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  R{p.current_amount_raised.toLocaleString("en-ZA")}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  of R{p.target_amount.toLocaleString("en-ZA")} ({percent}%)
                </span>
              </div>
              <Progress value={percent} className="h-1.5" />
            </div>
          )
        },
      },
      {
        accessorKey: "pledges_count",
        header: "Supporters",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            <span>{row.original.pledges_count || 0}</span>
          </div>
        ),
      },
      {
        id: "inquiries",
        header: "Inquiries",
        cell: ({ row }) => {
          const stats = inquiryCountMap[row.original.id] || { total: 0, newCount: 0 }
          return (
            <div className="flex items-center gap-1.5 text-xs">
              <MessageSquare className="size-3.5 text-muted-foreground" />
              <span>{stats.total}</span>
              {stats.newCount > 0 && (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] px-1 py-0 h-4"
                >
                  {stats.newCount} new
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
          const project = row.original
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
                    onClick={() => handleViewProject(project)}
                  >
                    <Eye className="mr-2 size-4 text-muted-foreground" />
                    View Details &amp; Inquiries
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      setProjectToEdit(project)
                      setEditDialogOpen(true)
                    }}
                  >
                    <Pencil className="mr-2 size-4 text-muted-foreground" />
                    Edit Project
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {project.status !== "active" && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleQuickStatusChange(project, "active")}
                    >
                      Mark as Active
                    </DropdownMenuItem>
                  )}
                  {project.status !== "funded" && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleQuickStatusChange(project, "funded")}
                    >
                      Mark as 100% Funded
                    </DropdownMenuItem>
                  )}
                  {project.status !== "completed" && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleQuickStatusChange(project, "completed")}
                    >
                      Mark as Completed
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => {
                      setProjectToDelete(project)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [inquiryCountMap]
  )

  const categories = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.category)))
  }, [projects])

  const table = useReactTable({
    data: projects,
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
      const p = row.original
      const q = String(filterValue).toLowerCase()
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.organizer_name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
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

  const categoryFilter = (table.getColumn("category")?.getFilterValue() as string) ?? ""
  const statusFilter = (table.getColumn("status")?.getFilterValue() as string) ?? ""

  const handleExport = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const rowsToExport = selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows
    const exportData = rowsToExport.map((r) => r.original)

    if (exportData.length === 0) {
      toast.error("No projects to export.")
      return
    }

    const csvContent = [
      [
        "ID",
        "Title",
        "Category",
        "Organizer",
        "Target Amount (ZAR)",
        "Raised (ZAR)",
        "Status",
        "Supporters",
        "Deadline",
        "Created At",
      ].join(","),
      ...exportData.map((p) =>
        [
          `"${p.id}"`,
          `"${p.title.replace(/"/g, '""')}"`,
          `"${p.category}"`,
          `"${p.organizer_name.replace(/"/g, '""')}"`,
          p.target_amount,
          p.current_amount_raised,
          `"${p.status}"`,
          p.pledges_count || 0,
          `"${p.deadline || ""}"`,
          `"${p.created_at}"`,
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `community-projects-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${exportData.length} project records.`)
  }

  return (
    <div className="w-full space-y-4">
      {/* Top Toolbar: Search + Export + New Project */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects, categories, organizers..."
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
          <Button
            className="cursor-pointer bg-[#1c472a] hover:bg-[#163d23] text-white"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="mr-2 size-4 text-[#7ed957]" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filter Row: Category + Status + Column Visibility */}
      <div className="grid gap-2 sm:grid-cols-3 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="project-category-filter" className="text-sm font-medium">
            Category
          </Label>
          <Select
            value={categoryFilter || ""}
            onValueChange={(val) =>
              table.getColumn("category")?.setFilterValue(val === "all" ? "" : val)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="project-category-filter">
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
          <Label htmlFor="project-status-filter" className="text-sm font-medium">
            Status
          </Label>
          <Select
            value={statusFilter || ""}
            onValueChange={(val) =>
              table.getColumn("status")?.setFilterValue(val === "all" ? "" : val)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="project-status-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="funded">100% Funded</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
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
                  onClick={() => handleViewProject(row.original)}
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
                  No community projects found.
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

      {/* Slide-Over Project Detail Sheet */}
      <ProjectDetailSheet
        project={viewingProject}
        inquiries={inquiries}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onProjectUpdated={onUpdateProject}
        onProjectDeleted={onDeleteProject}
        onInquiryStatusChange={onInquiryStatusChange}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{projectToDelete?.title}</strong> and remove it
              from the Hello Linden mobile app.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={pending}
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Dialog */}
      <ProjectFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={onUpdateProject}
      />

      {/* Edit Dialog */}
      <ProjectFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        project={projectToEdit}
        onSuccess={onUpdateProject}
      />
    </div>
  )
}
