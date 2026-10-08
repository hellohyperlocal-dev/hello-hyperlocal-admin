"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Megaphone,
  Pin,
  MapPin,
  Heart,
  Search,
  X,
  List,
  Grid2X2,
  Plus,
  Eye,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  Droplets,
  Zap,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  PinOff,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileUploader } from "@/components/media/file-uploader";
import type {
  WardUpdatesDashboardData,
  WardUpdateItem,
  CouncillorOption,
} from "@/lib/ward-updates";
import {
  createWardUpdate,
  deleteWardUpdate,
  togglePinWardUpdate,
} from "@/app/(dashboard)/ward-updates/actions";

interface WardUpdatesViewProps {
  initialData: WardUpdatesDashboardData;
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: typeof Info; color: string }
> = {
  water: {
    label: "Water Outage",
    icon: Droplets,
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-300/40",
  },
  "load-shedding": {
    label: "Load-Shedding",
    icon: Zap,
    color: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/40",
  },
  safety: {
    label: "Public Safety",
    icon: ShieldAlert,
    color: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300/40",
  },
  "road-closure": {
    label: "Road Closure",
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300/40",
  },
  notice: {
    label: "General Notice",
    icon: Info,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300/40",
  },
};

export function WardUpdatesView({ initialData }: WardUpdatesViewProps) {
  const { items, stats, councillors } = initialData;

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [wardFilter, setWardFilter] = useState("all");
  const [isGrid, setIsGrid] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WardUpdateItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<WardUpdateItem | null>(null);
  const [pending, startTransition] = useTransition();

  // Create form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("notice");
  const [ward, setWard] = useState("Ward 87");
  const [body, setBody] = useState("");
  const [councillorId, setCouncillorId] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const distinctWards = Array.from(new Set(items.map((i) => i.ward))).filter(Boolean);

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (wardFilter !== "all" && item.ward !== wardFilter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        item.councillorName.toLowerCase().includes(q) ||
        item.ward.toLowerCase().includes(q)
      );
    });
  }, [items, categoryFilter, wardFilter, query]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const columns = React.useMemo<ColumnDef<WardUpdateItem>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Broadcast Notice
            <ArrowUpDown className="ml-1.5 size-3 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => {
          const item = row.original;
          const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.notice;
          const CatIcon = cat.icon;
          return (
            <div className="flex items-center gap-3 min-w-0 max-w-[400px]">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="size-10 shrink-0 rounded-lg object-cover border border-border/50"
                />
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  <CatIcon className="size-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground flex items-center gap-1.5">
                  {item.isPinned && <Pin className="size-3.5 text-primary shrink-0" />}
                  <span className="truncate">{item.title}</span>
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.body.slice(0, 100)}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Category
            <ArrowUpDown className="ml-1.5 size-3 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => {
          const cat = CATEGORY_CONFIG[row.original.category] || CATEGORY_CONFIG.notice;
          return (
            <Badge variant="outline" className={`font-normal text-xs ${cat.color}`}>
              {cat.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "ward",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Ward
            <ArrowUpDown className="ml-1.5 size-3 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-mono text-xs">
            {row.original.ward}
          </Badge>
        ),
      },
      {
        accessorKey: "councillorName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Councillor
            <ArrowUpDown className="ml-1.5 size-3 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="size-7 border border-border/50">
                {item.councillorAvatar && <AvatarImage src={item.councillorAvatar} />}
                <AvatarFallback className="text-[10px] bg-muted font-medium">{item.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">{item.councillorName}</p>
                {item.councillorId && (
                  <Link
                    href={`/users/${item.councillorId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                  >
                    Profile <ExternalLink className="size-2.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "reactions",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Engagement
            <ArrowUpDown className="ml-1.5 size-3 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Heart className="size-3.5 text-rose-500/80 fill-rose-500/20" />
            <span className="font-medium text-foreground">{row.original.reactions}</span>
          </div>
        ),
      },
      {
        accessorKey: "date",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-1.5 size-3 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {row.original.date}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="text-right block w-full text-xs font-semibold pr-2">Actions</span>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-right" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedItem(item)}>
                    <Eye className="size-4 mr-2" /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTogglePin(item)}>
                    {item.isPinned ? (
                      <>
                        <PinOff className="size-4 mr-2" /> Unpin from feed
                      </>
                    ) : (
                      <>
                        <Pin className="size-4 mr-2" /> Pin to feed top
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeletingItem(item)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4 mr-2" /> Delete Update
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const table = useReactTable({
    data: filteredItems,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !ward.trim()) {
      toast.error("Title, message body, and ward are required.");
      return;
    }

    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("category", category);
    formData.set("ward", ward.trim());
    formData.set("body", body.trim());
    formData.set("isPinned", String(isPinned));
    if (councillorId) formData.set("councillorId", councillorId);
    if (uploadedImageUrl) formData.set("imageUrl", uploadedImageUrl);

    startTransition(async () => {
      const res = await createWardUpdate(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Ward update broadcast successfully.");
        setIsCreateOpen(false);
        setTitle("");
        setBody("");
        setIsPinned(false);
        setUploadedImageUrl("");
        setCouncillorId("");
      }
    });
  };

  const handleDelete = (item: WardUpdateItem) => {
    startTransition(async () => {
      const res = await deleteWardUpdate(item.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Ward update deleted.");
        setDeletingItem(null);
        if (selectedItem?.id === item.id) setSelectedItem(null);
      }
    });
  };

  const handleTogglePin = (item: WardUpdateItem) => {
    startTransition(async () => {
      const res = await togglePinWardUpdate(item.id, item.isPinned);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(item.isPinned ? "Update unpinned from feed." : "Update pinned to feed top.");
        if (selectedItem?.id === item.id) {
          setSelectedItem({ ...selectedItem, isPinned: !item.isPinned });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Content studio</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Ward Updates</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Oversight and direct publishing of councillor broadcasts and municipal alerts.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shrink-0">
          <Plus className="size-4" /> Broadcast Update
        </Button>
      </div>

      {/* STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 shadow-2xs">
          <CardContent className="flex items-start justify-between p-5">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Broadcasts</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground font-medium">All published updates</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              <Megaphone className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-2xs">
          <CardContent className="flex items-start justify-between p-5">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pinned Notices</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stats.pinned}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <Pin className="size-3" /> Featured at top of feed
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Pin className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-2xs">
          <CardContent className="flex items-start justify-between p-5">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Wards Covered</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stats.wardsCovered}</p>
              <p className="text-xs text-muted-foreground font-medium">Active jurisdictions</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <MapPin className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-2xs">
          <CardContent className="flex items-start justify-between p-5">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resident Reactions</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stats.totalReactions}</p>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <Heart className="size-3 fill-rose-500/20" /> Citizen engagement
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              <Heart className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTER & TOOLBAR - CLEAN FLEX ROW MATCHING CODEBASE */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search updates by title or councillor..."
            className="pl-9 h-9 text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <Select
            value={categoryFilter}
            onValueChange={(val) => {
              setCategoryFilter(val);
              table.setPageIndex(0);
            }}
          >
            <SelectTrigger className="h-9 w-[150px] text-xs sm:text-sm font-medium cursor-pointer">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem value="all" className="text-xs sm:text-sm cursor-pointer">All Categories</SelectItem>
              <SelectItem value="notice" className="text-xs sm:text-sm cursor-pointer">General Notice</SelectItem>
              <SelectItem value="water" className="text-xs sm:text-sm cursor-pointer">Water Outage</SelectItem>
              <SelectItem value="load-shedding" className="text-xs sm:text-sm cursor-pointer">Load-Shedding</SelectItem>
              <SelectItem value="road-closure" className="text-xs sm:text-sm cursor-pointer">Road Closure</SelectItem>
              <SelectItem value="safety" className="text-xs sm:text-sm cursor-pointer">Public Safety</SelectItem>
            </SelectContent>
          </Select>

          {/* Ward Filter */}
          <Select
            value={wardFilter}
            onValueChange={(val) => {
              setWardFilter(val);
              table.setPageIndex(0);
            }}
          >
            <SelectTrigger className="h-9 w-[130px] text-xs sm:text-sm font-medium cursor-pointer">
              <SelectValue placeholder="All Wards" />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem value="all" className="text-xs sm:text-sm cursor-pointer">All Wards</SelectItem>
              {distinctWards.map((w) => (
                <SelectItem key={w} value={w} className="text-xs sm:text-sm cursor-pointer">
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <Button
            variant="outline"
            size="icon"
            className="size-9 cursor-pointer"
            onClick={() => setIsGrid(!isGrid)}
            title={isGrid ? "Show table view" : "Show grid view"}
          >
            {isGrid ? <List className="size-4" /> : <Grid2X2 className="size-4" />}
          </Button>
        </div>
      </div>

      {/* TABLE OR GRID VIEW */}
      {filteredItems.length === 0 ? (
        <div className="rounded-md border bg-card py-16 text-center text-sm text-muted-foreground">
          No ward updates found matching your criteria.
        </div>
      ) : isGrid ? (
        /* GRID VIEW (using paginated rows) */
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {table.getRowModel().rows.map((row) => {
              const item = row.original;
              const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.notice;
              const CatIcon = cat.icon;

              return (
                <Card
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="cursor-pointer border-border/60 hover:border-primary/50 transition-all hover:shadow-xs group"
                >
                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="size-10 rounded-lg object-cover border border-border/50 shrink-0"
                          />
                        ) : (
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            <CatIcon className="size-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{item.councillorName}</p>
                          <p className="text-[11px] text-muted-foreground">{item.date}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                        {item.ward}
                      </Badge>
                    </div>

                    <div>
                      <p className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {item.isPinned && <Pin className="size-3.5 text-primary shrink-0" />}
                        <span className="truncate">{item.title}</span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.body}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                      <Badge variant="outline" className={`font-normal text-[11px] ${cat.color}`}>
                        {cat.label}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Heart className="size-3.5 text-rose-500 fill-rose-500/20" />
                        <span className="font-medium text-foreground">{item.reactions}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-18 text-xs cursor-pointer">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs cursor-pointer">
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="hidden sm:inline">
                Showing {table.getRowModel().rows.length} of {filteredItems.length} items
              </span>
            </div>

            <div className="flex items-center gap-4 font-medium">
              <span>
                Page {table.getPageCount() === 0 ? 0 : table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs cursor-pointer"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs cursor-pointer"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TABLE VIEW - SINGLE CLEAN BORDER MATCHING CODEBASE */
        <div className="space-y-4">
          <div className="rounded-md border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-xs">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => setSelectedItem(row.original)}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-18 text-xs cursor-pointer">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs cursor-pointer">
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="hidden sm:inline">
                Showing {table.getRowModel().rows.length} of {filteredItems.length} items
              </span>
            </div>

            <div className="flex items-center gap-4 font-medium">
              <span>
                Page {table.getPageCount() === 0 ? 0 : table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs cursor-pointer"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs cursor-pointer"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WARD UPDATE DETAIL SHEET (Spacious Flyout Inspector) */}
      <Sheet open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent className="w-full sm:!max-w-xl md:!max-w-2xl p-6 sm:p-8 overflow-y-auto">
          {selectedItem && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={CATEGORY_CONFIG[selectedItem.category]?.color}>
                    {CATEGORY_CONFIG[selectedItem.category]?.label || selectedItem.category}
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {selectedItem.ward}
                  </Badge>
                  {selectedItem.isPinned && (
                    <Badge variant="default" className="gap-1 bg-amber-600 text-white hover:bg-amber-600">
                      <Pin className="size-3" /> Pinned
                    </Badge>
                  )}
                </div>
                <SheetTitle className="text-xl font-bold pt-2">{selectedItem.title}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Published on {selectedItem.date} by {selectedItem.councillorName}
                </SheetDescription>
              </SheetHeader>

              {selectedItem.imageUrl && (
                <div className="overflow-hidden rounded-xl border border-border/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="w-full max-h-72 object-cover"
                  />
                </div>
              )}

              {/* Councillor Card */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/60 bg-muted/20">
                <Avatar className="size-10 border border-border/50">
                  {selectedItem.councillorAvatar && <AvatarImage src={selectedItem.councillorAvatar} />}
                  <AvatarFallback className="font-semibold text-xs">{selectedItem.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-foreground">{selectedItem.councillorName}</p>
                  <p className="text-xs text-muted-foreground">{selectedItem.ward} Representative</p>
                </div>
                {selectedItem.councillorId && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/users/${selectedItem.councillorId}`}>
                      Profile <ExternalLink className="size-3 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>

              {/* Full Notice Content */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notice Details</h4>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm leading-relaxed whitespace-pre-line">
                  {selectedItem.body}
                </div>
              </div>

              {/* Engagement Stat */}
              <Card className="p-4 border-border/60">
                <p className="text-xs text-muted-foreground">Resident Reactions</p>
                <p className="text-lg font-bold flex items-center gap-1.5 mt-1">
                  <Heart className="size-4 text-rose-500 fill-rose-500/20" /> {selectedItem.reactions} upvotes / reactions
                </p>
              </Card>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePin(selectedItem)}
                    disabled={pending}
                    className="gap-1.5"
                  >
                    {selectedItem.isPinned ? (
                      <>
                        <PinOff className="size-4" /> Unpin
                      </>
                    ) : (
                      <>
                        <Pin className="size-4" /> Pin to feed
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingItem(selectedItem)}
                    disabled={pending}
                    className="gap-1.5"
                  >
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* BROADCAST / ADD WARD UPDATE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Broadcast Ward Update</DialogTitle>
            <DialogDescription>
              Publish an official municipal notice. This will appear immediately in the mobile app feed for residents in this ward.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="notice-title">Notice Title</Label>
              <Input
                id="notice-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Water outage scheduled for Tuesday maintenance"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="notice-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="notice-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notice">General Notice</SelectItem>
                    <SelectItem value="water">Water Outage</SelectItem>
                    <SelectItem value="load-shedding">Load-Shedding</SelectItem>
                    <SelectItem value="road-closure">Road Closure</SelectItem>
                    <SelectItem value="safety">Public Safety</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notice-ward">Ward</Label>
                <Input
                  id="notice-ward"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="e.g. Ward 87"
                  required
                />
              </div>
            </div>

            {councillors.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="councillor-select">Ward Councillor Author</Label>
                <Select value={councillorId} onValueChange={setCouncillorId}>
                  <SelectTrigger id="councillor-select">
                    <SelectValue placeholder="Select representative councillor" />
                  </SelectTrigger>
                  <SelectContent>
                    {councillors.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.fullName} {c.ward ? `(${c.ward})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Cover Photo / Notice Graphic (optional)</Label>
              <FileUploader
                folder="ward-updates"
                maxFiles={1}
                maxSizeMB={25}
                onUploadComplete={(urls) => setUploadedImageUrl(urls[0] || "")}
                onRemove={() => setUploadedImageUrl("")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notice-body">Message Body</Label>
              <Textarea
                id="notice-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write the full details, estimated restoration times, or contact numbers..."
                className="min-h-32 resize-none text-sm"
                required
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
              <div>
                <p className="text-sm font-medium text-foreground">Pin to top of feed</p>
                <p className="text-xs text-muted-foreground">Keep at the very top of the mobile app announcements</p>
              </div>
              <Switch checked={isPinned} onCheckedChange={setIsPinned} />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending} className="gap-2">
                <Plus className="size-4" />
                {pending ? "Publishing…" : "Publish Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={Boolean(deletingItem)} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Ward Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deletingItem?.title}&rdquo;? This action cannot be undone and will remove the broadcast from all resident feeds.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingItem(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingItem && handleDelete(deletingItem)}
              disabled={pending}
            >
              {pending ? "Deleting…" : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
