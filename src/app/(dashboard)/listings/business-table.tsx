"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Eye,
  Edit3,
  Power,
  Trash2,
  Star,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { ListingDetailSheet } from "./listing-detail-sheet";
import { deleteBusiness, toggleBusinessOpen } from "./actions";
import type { BusinessRow } from "@/lib/listings-types";

interface Props {
  businesses: BusinessRow[];
}

export function BusinessTable({ businesses }: Props) {
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<BusinessRow | null>(null);
  const [pending, startTransition] = useTransition();

  const handleRowClick = (b: BusinessRow) => {
    setSelectedBusiness(b);
    setSheetOpen(true);
  };

  const handleToggleOpen = (e: React.MouseEvent, b: BusinessRow) => {
    e.stopPropagation();
    startTransition(async () => {
      const next = !b.is_open;
      const res = await toggleBusinessOpen(b.id, next);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`"${b.name}" is now marked as ${next ? "Open" : "Closed"}.`);
    });
  };

  const handleDeleteConfirm = () => {
    if (!businessToDelete) return;
    startTransition(async () => {
      const res = await deleteBusiness(businessToDelete.id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`"${businessToDelete.name}" has been deleted.`);
      setBusinessToDelete(null);
      if (selectedBusiness?.id === businessToDelete.id) {
        setSheetOpen(false);
      }
    });
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Name</TableHead>
              <TableHead className="min-w-[120px]">Category</TableHead>
              <TableHead className="hidden md:table-cell min-w-[180px]">Address</TableHead>
              <TableHead className="hidden sm:table-cell min-w-[110px]">Rating</TableHead>
              <TableHead className="min-w-[90px]">Status</TableHead>
              <TableHead className="text-right min-w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-muted-foreground"
                >
                  No businesses found. Click &quot;Add Business&quot; above to create one.
                </TableCell>
              </TableRow>
            ) : (
              businesses.map((b) => (
                <TableRow
                  key={b.id}
                  onClick={() => handleRowClick(b)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors group"
                >
                  <TableCell className="font-medium text-foreground">
                    <div className="flex flex-col">
                      <span className="group-hover:text-emerald-700 dark:group-hover:text-emerald-400 font-semibold transition-colors">
                        {b.name}
                      </span>
                      {b.address && (
                        <span className="md:hidden text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="size-3 shrink-0" />
                          <span className="truncate max-w-[180px]">{b.address}</span>
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-normal">
                      {b.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {b.address || "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="size-3.5 fill-amber-500 text-amber-500" />
                      <span className="font-medium">{b.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">
                        ({b.review_count})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleToggleOpen(e, b)}
                      disabled={pending}
                      className="cursor-pointer rounded focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      title="Click to toggle open/closed"
                    >
                      <Badge
                        variant={b.is_open ? "secondary" : "outline"}
                        className={`text-xs font-medium cursor-pointer transition-all ${
                          b.is_open
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-200"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {b.is_open ? "Open" : "Closed"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 p-0"
                          disabled={pending}
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleRowClick(b)}>
                          <Eye className="size-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/listings/business/${b.id}`}>
                            <Edit3 className="size-4 mr-2" />
                            Edit Business
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleToggleOpen(e, b)}>
                          <Power className="size-4 mr-2" />
                          Mark as {b.is_open ? "Closed" : "Open"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => setBusinessToDelete(b)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete Business
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Slide-over Detail Sheet (Option A) */}
      <ListingDetailSheet
        item={selectedBusiness ? { type: "business", data: selectedBusiness } : null}
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
            >
              {pending ? "Deleting..." : "Yes, Delete Business"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
