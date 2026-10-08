"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  MessageSquare,
  ShoppingBag,
  AlertTriangle,
  Check,
  X,
  Eye,
  Search,
  ExternalLink,
  Tag,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import type { ModerationDashboardData, ModerationQueueItem } from "@/lib/moderation";
import { approveContent, rejectContent, resolveReport } from "@/app/(dashboard)/moderation/actions";

interface ModerationViewProps {
  initialData: ModerationDashboardData;
}

const PRESET_REASONS = [
  "Spam or commercial advertising",
  "Inappropriate or offensive content",
  "Off-topic or incorrect category",
  "Violates Linden community guidelines",
];

export function ModerationView({ initialData }: ModerationViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "posts" | "marketplace" | "reports">("all");
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ModerationQueueItem | null>(null);
  const [rejectingItem, setRejectingItem] = useState<ModerationQueueItem | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [pending, startTransition] = useTransition();

  const { stats, items } = initialData;

  // Filter items based on tab and search
  const filteredItems = items.filter((item) => {
    // Tab filter
    if (activeTab === "posts" && item.kind !== "community_posts") return false;
    if (activeTab === "marketplace" && item.kind !== "marketplace_listings" && item.kind !== "love_local_offers") return false;
    if (activeTab === "reports" && item.kind !== "reports") return false;

    // Search query
    if (query.trim()) {
      const q = query.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.authorName.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q) ||
        (item.reportReason && item.reportReason.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const handleApprove = (item: ModerationQueueItem) => {
    startTransition(async () => {
      if (item.kind === "reports") {
        const res = await resolveReport(item.id, "resolved");
        if (res.error) toast.error(res.error);
        else toast.success("Report resolved.");
      } else if (item.table) {
        const res = await approveContent(item.table, item.id);
        if (res.error) toast.error(res.error);
        else toast.success("Content approved and published live.");
      }
      if (selectedItem?.id === item.id) setSelectedItem(null);
    });
  };

  const handleConfirmReject = () => {
    if (!rejectingItem) return;
    const finalReason = customReason.trim()
      ? `${selectedPreset}: ${customReason.trim()}`
      : selectedPreset;

    startTransition(async () => {
      if (rejectingItem.kind === "reports") {
        const res = await resolveReport(rejectingItem.id, "dismissed");
        if (res.error) toast.error(res.error);
        else toast.success("Report dismissed.");
      } else if (rejectingItem.table) {
        const res = await rejectContent(rejectingItem.table, rejectingItem.id, finalReason);
        if (res.error) toast.error(res.error);
        else toast.success("Submission rejected.");
      }
      setRejectingItem(null);
      setCustomReason("");
      if (selectedItem?.id === rejectingItem.id) setSelectedItem(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Content studio</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Moderation Queue</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Review pending resident submissions and resolve community reports before they go live.
          </p>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 shadow-2xs">
          <CardContent className="flex items-start justify-between p-5">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Pending</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stats.totalPending}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <Clock className="size-3" /> Awaiting admin review
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <ShieldAlert className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-2xs">
          <CardContent className="flex items-start justify-between p-5">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Community Posts</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stats.pendingPosts}</p>
              <p className="text-xs text-muted-foreground font-medium">Resident talk & events</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              <MessageSquare className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-2xs">
          <CardContent className="flex items-start justify-between p-5">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Marketplace & Deals</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stats.pendingMarketplace}</p>
              <p className="text-xs text-muted-foreground font-medium">Items for sale & promos</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
              <ShoppingBag className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-2xs">
          <CardContent className="flex items-start justify-between p-5">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Open Reports</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stats.openReports}</p>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="size-3" /> Flagged by community
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              <AlertTriangle className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTER & TOOLBAR */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* QUEUE TABS */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab("all")}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "all"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            All Pending
            <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px]">
              {stats.totalPending}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "posts"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            Community Posts
            <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px]">
              {stats.pendingPosts}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "marketplace"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            Marketplace & Deals
            <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px]">
              {stats.pendingMarketplace}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "reports"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            Flagged Reports
            <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px]">
              {stats.openReports}
            </span>
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search queue..."
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
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-md border bg-card py-16 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-1">
            <CheckCircle2 className="size-6" />
          </div>
          <p className="font-semibold text-foreground text-base">All clear!</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            No pending content or reports currently require moderation in this section.
          </p>
        </div>
      ) : (
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="min-w-[320px]">Submitted Item</TableHead>
                <TableHead className="w-[160px]">Category / Type</TableHead>
                <TableHead className="w-[180px]">Submitted By</TableHead>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[130px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const isReport = item.kind === "reports";

                return (
                  <TableRow
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    {/* Item preview */}
                    <TableCell className="font-medium">
                      <div className="flex min-w-0 items-center gap-3">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="size-11 shrink-0 rounded-lg object-cover border border-border/50"
                          />
                        ) : (
                          <div
                            className={`flex size-11 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                              isReport
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                            }`}
                          >
                            {isReport ? <AlertTriangle className="size-5" /> : item.initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <span className="truncate">{item.title}</span>
                            {item.price && (
                              <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 shrink-0">
                                {item.price}
                              </Badge>
                            )}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.excerpt}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category / Type */}
                    <TableCell>
                      <Badge
                        variant={isReport ? "destructive" : "secondary"}
                        className="w-fit font-normal text-xs"
                      >
                        {item.category}
                      </Badge>
                    </TableCell>

                    {/* Author / Submitter */}
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar className="size-7 border border-border/50">
                          {item.authorAvatar && <AvatarImage src={item.authorAvatar} />}
                          <AvatarFallback className="text-[10px] bg-muted font-medium">{item.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-foreground">{item.authorName}</p>
                          {item.authorId && (
                            <Link
                              href={`/users/${item.authorId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] text-primary hover:underline flex items-center gap-1"
                            >
                              View profile <ExternalLink className="size-2.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.date}
                    </TableCell>

                    {/* Quick Action Buttons */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="size-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30"
                          title={isReport ? "Resolve report" : "Approve and publish"}
                          disabled={pending}
                          onClick={() => handleApprove(item)}
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="size-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                          title={isReport ? "Dismiss report" : "Reject submission"}
                          disabled={pending}
                          onClick={() => setRejectingItem(item)}
                        >
                          <X className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="size-8 p-0 text-muted-foreground hover:text-foreground"
                          title="Inspect details"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* PRESET REJECTION MODAL */}
      <Dialog open={Boolean(rejectingItem)} onOpenChange={(open) => !open && setRejectingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {rejectingItem?.kind === "reports" ? "Dismiss Report" : "Reject Submission"}
            </DialogTitle>
            <DialogDescription>
              {rejectingItem?.kind === "reports"
                ? "Dismiss this user-flagged report if no rules were violated."
                : `Select a reason for rejecting "${rejectingItem?.title}". This note will be recorded in the audit log.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Common Preset Reasons
              </label>
              <div className="flex flex-col gap-1.5">
                {PRESET_REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedPreset(reason)}
                    className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs font-medium transition-colors cursor-pointer ${
                      selectedPreset === reason
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border/60 hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <Tag className="size-3.5 shrink-0" />
                    <span>{reason}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="custom-reason" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Additional Notes / Explanation (Optional)
              </label>
              <Textarea
                id="custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Add any specific context or guidance for the user..."
                className="min-h-20 resize-none text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setRejectingItem(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={pending}
            >
              {pending ? "Processing…" : rejectingItem?.kind === "reports" ? "Dismiss Report" : "Reject Submission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODERATION DETAIL SHEET (Flyout) */}
      <Sheet open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent className="w-full sm:!max-w-xl md:!max-w-2xl p-6 sm:p-8 overflow-y-auto">
          {selectedItem && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedItem.kind === "reports" ? "destructive" : "secondary"}>
                    {selectedItem.category}
                  </Badge>
                  <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30">
                    Pending Review
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold pt-2">{selectedItem.title}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Submitted {selectedItem.date} by {selectedItem.authorName}
                </SheetDescription>
              </SheetHeader>

              {selectedItem.imageUrl && (
                <div className="overflow-hidden rounded-xl border border-border/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedItem.imageUrl}
                    alt=""
                    className="w-full max-h-72 object-cover"
                  />
                </div>
              )}

              {selectedItem.price && (
                <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-3 border border-border/60">
                  <Tag className="size-4 text-primary" />
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Listed Price:</span>
                  <span className="font-bold text-foreground text-sm">{selectedItem.price}</span>
                </div>
              )}

              {selectedItem.reportReason && (
                <div className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-xs font-semibold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5" /> Flagged Report Reason
                  </p>
                  <p className="text-sm font-medium text-foreground">{selectedItem.reportReason}</p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {selectedItem.kind === "reports" ? "Reported Content" : "Submission Content"}
                </h4>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm leading-relaxed whitespace-pre-line text-foreground">
                  {selectedItem.content}
                </div>
              </div>

              {selectedItem.authorId && (
                <div className="rounded-xl border border-border/60 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8">
                      {selectedItem.authorAvatar && <AvatarImage src={selectedItem.authorAvatar} />}
                      <AvatarFallback className="text-xs font-semibold">{selectedItem.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{selectedItem.authorName}</p>
                      <p className="text-[11px] text-muted-foreground">Community Member</p>
                    </div>
                  </div>
                  <Link
                    href={`/users/${selectedItem.authorId}`}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    User Profile <ExternalLink className="size-3" />
                  </Link>
                </div>
              )}

              {/* ACTION BAR */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10 border-destructive/30 gap-1.5 flex-1"
                  onClick={() => setRejectingItem(selectedItem)}
                  disabled={pending}
                >
                  <X className="size-4" />
                  {selectedItem.kind === "reports" ? "Dismiss Report" : "Reject Submission"}
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 flex-1"
                  onClick={() => handleApprove(selectedItem)}
                  disabled={pending}
                >
                  <Check className="size-4" />
                  {selectedItem.kind === "reports" ? "Resolve Report" : "Approve & Publish"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
