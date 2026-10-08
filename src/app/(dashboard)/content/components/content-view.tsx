"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import {
  Archive,
  CalendarDays,
  Clock3,
  Eye,
  FileText,
  Grid2X2,
  Heart,
  List,
  MoreHorizontal,
  Plus,
  Search,
  TrendingUp,
  Users,
  X,
  Trash2,
  Pin,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileUploader } from "@/components/media/file-uploader";
import type { CmsPost, CmsContentData } from "@/lib/content";
import { createCmsPost, deleteCmsPost } from "../actions";

interface ContentViewProps {
  posts: CmsPost[];
  stats: CmsContentData["stats"];
  initialTab?: "All Posts" | "Drafts" | "Scheduled";
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ElementType;
  tone: string;
}) {
  return (
    <Card className="border-border/70 shadow-2xs">
      <CardContent className="flex items-start justify-between p-5">
        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <TrendingUp className="size-3.5 text-emerald-600" />
            {detail}
          </p>
        </div>
        <div className={`flex size-10 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Published"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
      : status === "Scheduled"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
      : "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30";

  return (
    <Badge variant="outline" className={`gap-1.5 rounded-full font-medium text-xs px-2.5 py-0.5 ${tone}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}

export function ContentView({ posts: initialPosts, stats, initialTab = "All Posts" }: ContentViewProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [isGrid, setIsGrid] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CmsPost | null>(null);

  // Creation form state
  const [createPending, startCreateTransition] = useTransition();
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [postType, setPostType] = useState("Community Update");
  const [category, setCategory] = useState("Neighbourhood Talk");
  const [statusVal, setStatusVal] = useState("Publish immediately");
  const [isPinned, setIsPinned] = useState(false);
  const [sendPush, setSendPush] = useState(false);

  // Filter posts
  const filteredPosts = initialPosts.filter((post) => {
    // Tab filter
    if (activeTab === "Drafts" && post.status !== "Draft") return false;
    if (activeTab === "Scheduled" && post.status !== "Scheduled") return false;

    // Search query
    if (query.trim()) {
      const q = query.toLowerCase();
      const match =
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category filter
    if (categoryFilter !== "All Categories" && post.category !== categoryFilter) {
      return false;
    }

    return true;
  });

  const categories = [
    "All Categories",
    "Neighbourhood Talk",
    "Events",
    "Ward & Alerts",
    "Local Deals",
    "Lost & Found",
    "Local Jobs",
  ];

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const submitter = (e.nativeEvent as SubmitEvent)?.submitter as HTMLButtonElement | null;
    const isDraft = submitter?.value === "draft" || statusVal === "Save draft";
    const formData = new FormData(form);

    formData.set("postType", postType);
    formData.set("category", category);
    formData.set("imageUrl", uploadedImageUrl);
    formData.set("status", isDraft ? "draft" : "published");
    formData.set("isPinned", isPinned ? "true" : "false");

    startCreateTransition(async () => {
      const res = await createCmsPost(formData);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(isDraft ? "Draft saved successfully." : "Post published successfully.");
      setIsCreating(false);
      setUploadedImageUrl("");
      form.reset();
    });
  }

  async function handleDelete(post: CmsPost) {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;
    const res = await deleteCmsPost(post.id, post.sourceTable);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Post deleted.");
      if (selectedPost?.id === post.id) {
        setSelectedPost(null);
      }
    }
  }

  // If in creation mode, render the Vercel-style 2-column editor
  if (isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => setIsCreating(false)}
              className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="size-4" />
              Close editor
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Create Post</h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Create engaging hyperlocal content and publish to the mobile app.
            </p>
          </div>
          <Button
            type="submit"
            form="create-post-form"
            name="submitAction"
            value="draft"
            variant="outline"
            disabled={createPending}
          >
            Save draft
          </Button>
        </div>

        <form id="create-post-form" onSubmit={handleCreateSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* LEFT COLUMN: CONTENT */}
          <div className="flex flex-col gap-6">
            <Card className="border-border/70">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-base font-semibold">Content</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 pt-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="title" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Post title
                  </label>
                  <Input
                    id="title"
                    name="title"
                    className="h-11 text-base font-medium"
                    placeholder="Enter post title..."
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Post type
                    </label>
                    <select
                      value={postType}
                      onChange={(e) => setPostType(e.target.value)}
                      className="h-10 rounded-lg border border-input bg-background px-3 text-sm font-medium"
                    >
                      <option>Community Update</option>
                      <option>Official Ward Alert</option>
                      <option>Local Event</option>
                      <option>Love Local Deal</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-10 rounded-lg border border-input bg-background px-3 text-sm font-medium"
                    >
                      <option>Neighbourhood Talk</option>
                      <option>Ward & Alerts</option>
                      <option>Events</option>
                      <option>Local Deals</option>
                      <option>Lost & Found</option>
                      <option>Local Jobs</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="excerpt" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Short description
                  </label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    placeholder="Give residents a quick overview..."
                    className="min-h-20 resize-none text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cover photo (optional)
                  </label>
                  <FileUploader
                    folder="community-posts"
                    maxFiles={1}
                    maxSizeMB={25}
                    onUploadComplete={(urls) => setUploadedImageUrl(urls[0] || "")}
                    onRemove={() => setUploadedImageUrl("")}
                  />
                  {uploadedImageUrl && (
                    <p className="text-xs text-primary font-medium flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Photo uploaded and ready to publish.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="content" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Post body
                  </label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Write your full community announcement or details..."
                    className="min-h-40 resize-none text-sm"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: PUBLISHING & DISTRIBUTION */}
          <div className="flex flex-col gap-6">
            <Card className="border-border/70">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-base font-semibold">Publishing</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 pt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm font-medium"
                  >
                    <option>Publish immediately</option>
                    <option>Save draft</option>
                  </select>
                </div>
                <Button type="submit" disabled={createPending} className="w-full gap-2">
                  <Plus className="size-4" />
                  {createPending ? "Publishing…" : statusVal === "Save draft" ? "Save Draft" : "Publish Post"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-base font-semibold">Distribution & alerts</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 pt-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground">Pin to top of feed</p>
                    <p className="text-xs text-muted-foreground">Keep at the top of the mobile feed</p>
                  </div>
                  <Switch checked={isPinned} onCheckedChange={setIsPinned} />
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground">Push notification</p>
                    <p className="text-xs text-muted-foreground">Notify residents immediately</p>
                  </div>
                  <Switch checked={sendPush} onCheckedChange={setSendPush} />
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                  <Users className="size-4 text-primary" />
                  <span>Audience: <strong>All Linden residents</strong></span>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Content studio</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{activeTab}</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            View and manage all community posts, ward announcements, and listings.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2 shrink-0">
          <Plus className="size-4" /> Create Post
        </Button>
      </div>

      {/* STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total content"
          value={stats.total}
          detail="All posts & updates"
          icon={FileText}
          tone="bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
        />
        <StatCard
          label="Published"
          value={stats.published}
          detail="Live in mobile app"
          icon={TrendingUp}
          tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduled}
          detail="Queued for release"
          icon={CalendarDays}
          tone="bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
        />
        <StatCard
          label="Drafts"
          value={stats.drafts}
          detail="Pending publication"
          icon={Archive}
          tone="bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
        />
      </div>

      {/* FILTER & TOOLBAR */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts by title or author..."
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

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-xs sm:text-sm font-medium"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

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

      {filteredPosts.length === 0 ? (
        <div className="rounded-md border bg-card py-16 text-center text-sm text-muted-foreground">
          No posts found matching your criteria.
        </div>
      ) : isGrid ? (
        /* GRID VIEW */
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="cursor-pointer border-border/60 hover:border-primary/50 transition-all hover:shadow-xs group"
            >
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {post.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="size-10 rounded-lg object-cover border border-border/50 shrink-0"
                      />
                    ) : (
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${post.color}`}
                      >
                        {post.initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{post.author}</p>
                      <p className="text-[11px] text-muted-foreground">{post.date}</p>
                    </div>
                  </div>
                  <StatusBadge status={post.status} />
                </div>

                <div>
                  <p className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {post.isPinned && <Pin className="size-3 inline-block mr-1 text-primary" />}
                    {post.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                  <Badge variant="secondary" className="font-normal text-[11px]">
                    {post.category}
                  </Badge>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1" title={`${post.likes} likes`}>
                      <Heart className="size-3 text-rose-500/80 fill-rose-500/20" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1" title={`${post.comments} comments`}>
                      <MessageSquare className="size-3 text-blue-500/80" /> {post.comments}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* TABLE VIEW - SINGLE CLEAN BORDER MATCHING CODEBASE */
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="min-w-[320px]">Post</TableHead>
                <TableHead className="w-[140px]">Category</TableHead>
                <TableHead className="w-[180px]">Author</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[140px]">Engagement</TableHead>
                <TableHead className="w-[50px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  {/* Post column */}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3 min-w-0">
                      {post.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="size-10 shrink-0 rounded-lg object-cover border border-border/50"
                        />
                      ) : (
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${post.color}`}
                        >
                          {post.initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground flex items-center gap-1.5">
                          {post.isPinned && <Pin className="size-3 text-primary shrink-0" />}
                          <span className="truncate">{post.title}</span>
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{post.excerpt}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category column */}
                  <TableCell>
                    <Badge variant="secondary" className="w-fit font-normal text-xs">
                      {post.category}
                    </Badge>
                  </TableCell>

                  {/* Author column */}
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="size-7 border border-border/50">
                        {post.authorAvatar && <AvatarImage src={post.authorAvatar} />}
                        <AvatarFallback className="text-[10px] bg-muted font-medium">{post.initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-foreground">{post.author}</p>
                        <p className="text-[10px] text-muted-foreground">{post.date}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status column */}
                  <TableCell>
                    <StatusBadge status={post.status} />
                  </TableCell>

                  {/* Engagement column */}
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1" title={`${post.likes} likes`}>
                        <Heart className="size-3.5 text-rose-500/80 fill-rose-500/20" />
                        <span className="font-medium text-foreground">{post.likes}</span>
                      </span>
                      <span className="flex items-center gap-1" title={`${post.comments} comments`}>
                        <MessageSquare className="size-3.5 text-blue-500/80" />
                        <span className="font-medium text-foreground">{post.comments}</span>
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions column */}
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedPost(post)}>
                          <Eye className="size-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(post)} className="text-destructive">
                          <Trash2 className="size-4 mr-2" /> Delete Post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* POST DETAIL SHEET (Flyout) */}
      <Sheet open={Boolean(selectedPost)} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <SheetContent className="w-full sm:!max-w-xl md:!max-w-2xl p-6 sm:p-8 overflow-y-auto">
          {selectedPost && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedPost.category}</Badge>
                  <StatusBadge status={selectedPost.status} />
                </div>
                <SheetTitle className="text-xl font-bold pt-2">{selectedPost.title}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Published on {selectedPost.date} by {selectedPost.author}
                </SheetDescription>
              </SheetHeader>

              {selectedPost.imageUrl && (
                <div className="overflow-hidden rounded-xl border border-border/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedPost.imageUrl}
                    alt={selectedPost.title}
                    className="w-full max-h-72 object-cover"
                  />
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Content</h4>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm leading-relaxed whitespace-pre-line">
                  {selectedPost.content}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Card className="p-3 border-border/60">
                  <p className="text-xs text-muted-foreground">Likes / Upvotes</p>
                  <p className="text-lg font-bold flex items-center gap-1.5 mt-1">
                    <Heart className="size-4 text-rose-500 fill-rose-500/20" /> {selectedPost.likes}
                  </p>
                </Card>
                <Card className="p-3 border-border/60">
                  <p className="text-xs text-muted-foreground">Comments</p>
                  <p className="text-lg font-bold flex items-center gap-1.5 mt-1">
                    <MessageSquare className="size-4 text-blue-500" /> {selectedPost.comments}
                  </p>
                </Card>
              </div>

              <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedPost)}
                  className="gap-1.5"
                >
                  <Trash2 className="size-4" /> Delete post
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedPost(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
