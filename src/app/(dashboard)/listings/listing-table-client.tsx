"use client";

import { useState, useTransition } from "react";
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
import { MoreHorizontal, Eye, Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ListingDetailSheet } from "./listing-detail-sheet";
import { deleteListing, unpublishListing } from "./actions";
import type { ListingRow, LoveLocalOfferRow } from "@/lib/listings-types";

interface Props {
  table: "marketplace_listings" | "love_local_offers";
  listings: (ListingRow | LoveLocalOfferRow)[];
}

export function ListingTableClient({ table, listings }: Props) {
  const [selectedItem, setSelectedItem] = useState<{
    type: "marketplace" | "offer";
    data: ListingRow | LoveLocalOfferRow;
  } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<(ListingRow | LoveLocalOfferRow) | null>(null);
  const [pending, startTransition] = useTransition();

  const handleRowClick = (item: ListingRow | LoveLocalOfferRow) => {
    setSelectedItem({
      type: table === "marketplace_listings" ? "marketplace" : "offer",
      data: item,
    });
    setSheetOpen(true);
  };

  const handleUnpublish = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    startTransition(async () => {
      const res = await unpublishListing(table, id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Listing unpublished.");
    });
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    startTransition(async () => {
      const res = await deleteListing(table, itemToDelete.id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`"${itemToDelete.title}" has been deleted.`);
      setItemToDelete(null);
      if (selectedItem?.data.id === itemToDelete.id) {
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
              <TableHead className="min-w-[180px]">Title</TableHead>
              <TableHead className="min-w-[120px]">Category</TableHead>
              <TableHead className="min-w-[100px]">Price</TableHead>
              <TableHead className="min-w-[90px]">Status</TableHead>
              <TableHead className="text-right min-w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-28 text-center text-muted-foreground"
                >
                  Nothing here yet.
                </TableCell>
              </TableRow>
            ) : (
              listings.map((l) => (
                <TableRow
                  key={l.id}
                  onClick={() => handleRowClick(l)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors group"
                >
                  <TableCell className="font-medium text-foreground">
                    <span className="group-hover:text-emerald-700 dark:group-hover:text-emerald-400 font-semibold transition-colors">
                      {l.title}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-normal">
                      {l.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-emerald-700 dark:text-emerald-400">
                    {"offer_price" in l && l.offer_price ? l.offer_price : l.price}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        l.moderation_status === "approved"
                          ? "secondary"
                          : l.moderation_status === "rejected"
                          ? "outline"
                          : "default"
                      }
                      className="capitalize text-xs"
                    >
                      {l.moderation_status}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => handleRowClick(l)}>
                          <Eye className="size-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {l.moderation_status !== "rejected" && (
                          <DropdownMenuItem onClick={(e) => handleUnpublish(e, l.id)}>
                            <Ban className="size-4 mr-2" />
                            Unpublish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => setItemToDelete(l)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete Listing
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

      {/* Slide-over Detail Sheet */}
      <ListingDetailSheet
        item={
          selectedItem
            ? selectedItem.type === "marketplace"
              ? { type: "marketplace", data: selectedItem.data as ListingRow }
              : { type: "offer", data: selectedItem.data as LoveLocalOfferRow }
            : null
        }
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
            <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <strong>&quot;{itemToDelete?.title}&quot;</strong>? This action cannot be undone.
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
              {pending ? "Deleting..." : "Yes, Delete Listing"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
