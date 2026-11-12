"use client"

import { useState, useTransition } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
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
import {
  HeartHandshake,
  Calendar,
  Users,
  MessageSquare,
  MessageCircle,
  Mail,
  Pencil,
  Trash2,
  ExternalLink,
  Layers,
  MapPin,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"
import { deleteProjectAction, updateProjectAction, updateInquiryStatusAction } from "../actions"
import { ProjectFormDialog } from "./project-form-dialog"
import type {
  CommunityProject,
  CommunityProjectInquiry,
  InquiryStatus,
  ProjectStatus,
} from "@/lib/community-projects-types"
import {
  CONTRIBUTION_TYPE_CONFIG,
  PROJECT_CATEGORIES,
} from "@/lib/community-projects-types"

interface ProjectDetailSheetProps {
  project: CommunityProject | null
  inquiries: CommunityProjectInquiry[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectUpdated?: () => void
  onProjectDeleted?: (id: string) => void
  onInquiryStatusChange?: (inquiryId: string, status: InquiryStatus) => void
}

export function ProjectDetailSheet({
  project,
  inquiries,
  open,
  onOpenChange,
  onProjectUpdated,
  onProjectDeleted,
  onInquiryStatusChange,
}: ProjectDetailSheetProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!project) return null

  // Inquiries for this specific project
  const projectInquiries = inquiries.filter((i) => i.project_id === project.id)

  const percentRaised = Math.min(
    100,
    Math.round((project.current_amount_raised / (project.target_amount || 1)) * 100)
  )
  const remaining = Math.max(0, project.target_amount - project.current_amount_raised)

  const formattedRaised = `R${project.current_amount_raised.toLocaleString("en-ZA")}`
  const formattedTarget = `R${project.target_amount.toLocaleString("en-ZA")}`
  const formattedRemaining = `R${remaining.toLocaleString("en-ZA")}`

  const handleDeleteConfirm = () => {
    startTransition(async () => {
      const res = await deleteProjectAction(project.id)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(`"${project.title}" has been deleted.`)
      setDeleteDialogOpen(false)
      onOpenChange(false)
      onProjectDeleted?.(project.id)
    })
  }

  const handleStatusChange = (newStatus: ProjectStatus) => {
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
        toast.success(`Project marked as ${newStatus}.`)
        onProjectUpdated?.()
      }
    })
  }

  const getStatusBadge = (status: ProjectStatus) => {
    if (status === "active") {
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 gap-1.5"
        >
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Active
        </Badge>
      )
    }
    if (status === "funded") {
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 gap-1.5"
        >
          <span className="size-1.5 rounded-full bg-blue-500" />
          100% Funded
        </Badge>
      )
    }
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

  const getCategoryBadge = (categoryName: string) => {
    const config = PROJECT_CATEGORIES.find(
      (c) => c.value.toLowerCase() === categoryName.toLowerCase()
    )
    const color = config?.color || "bg-muted text-muted-foreground border-border"
    return (
      <Badge variant="outline" className={`text-xs font-normal ${color}`}>
        {categoryName}
      </Badge>
    )
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:w-[540px] data-[side=right]:sm:w-[540px] data-[side=right]:!max-w-[540px] p-0 flex flex-col h-full overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Header: Title & Badges */}
            <div className="flex flex-col gap-2 pr-8">
              {project.image_url && (
                <div className="relative h-44 w-full rounded-lg overflow-hidden border mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <SheetTitle className="text-xl font-bold">{project.title}</SheetTitle>
              </div>

              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                {getCategoryBadge(project.category)}
                {getStatusBadge(project.status)}
              </div>

              <p className="text-sm text-muted-foreground">
                Organized by <strong className="text-foreground">{project.organizer_name}</strong>
              </p>
            </div>

            <Separator />

            {/* Funding Progress Card */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Funding Progress
                </span>
                <span className="text-xs font-bold text-primary font-mono">
                  {percentRaised}% Funded
                </span>
              </div>

              <Progress value={percentRaised} className="h-2.5" />

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="rounded border bg-background p-2">
                  <p className="text-[11px] text-muted-foreground font-medium">Raised</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{formattedRaised}</p>
                </div>
                <div className="rounded border bg-background p-2">
                  <p className="text-[11px] text-muted-foreground font-medium">Target</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{formattedTarget}</p>
                </div>
                <div className="rounded border bg-background p-2">
                  <p className="text-[11px] text-muted-foreground font-medium">Remaining</p>
                  <p className="text-sm font-bold text-muted-foreground mt-0.5">
                    {formattedRemaining}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <Users className="size-3.5" />
                  {project.pledges_count || 0} supporters pledged
                </span>
                {project.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    Target: {new Date(project.deadline).toLocaleDateString("en-ZA")}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                About This Initiative
              </h4>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {project.description}
              </p>
            </div>

            <Separator />

            {/* Resident Inquiries Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-primary" />
                  Resident Inquiries ({projectInquiries.length})
                </h4>
              </div>

              {projectInquiries.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                  No resident inquiries submitted for this project yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {projectInquiries.map((inq) => {
                    const cleanPhone = inq.phone.replace(/[^0-9]/g, "").replace(/^0/, "")
                    const waUrl = `https://wa.me/27${cleanPhone}?text=${encodeURIComponent(
                      `Hi ${inq.resident_name}, thank you for reaching out regarding the ${project.title} project on Hello Linden!`
                    )}`
                    const mailUrl = `mailto:${inq.email}?subject=${encodeURIComponent(
                      `Hello Linden: ${project.title}`
                    )}`

                    return (
                      <div
                        key={inq.id}
                        className="rounded-lg border bg-background p-3.5 space-y-2.5 text-xs shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-foreground text-sm">
                              {inq.resident_name}
                            </p>
                            {inq.street_address && (
                              <p className="text-muted-foreground text-[11px] flex items-center gap-1 mt-0.5">
                                <MapPin className="size-3 text-primary shrink-0" />
                                {inq.street_address}
                              </p>
                            )}
                          </div>

                          <Badge
                            variant="outline"
                            className={
                              inq.status === "new"
                                ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
                                : inq.status === "contacted"
                                ? "bg-blue-500/10 text-blue-700 border-blue-500/30"
                                : "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                            }
                          >
                            {inq.status === "new"
                              ? "New Lead"
                              : inq.status === "contacted"
                              ? "Contacted"
                              : "Connected"}
                          </Badge>
                        </div>

                        {/* Offers */}
                        <div className="flex flex-wrap gap-1">
                          {inq.contribution_types.map((type) => {
                            const cfg = CONTRIBUTION_TYPE_CONFIG[type] || {
                              label: type,
                              badgeClass: "bg-muted text-muted-foreground",
                            }
                            return (
                              <Badge
                                key={type}
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 font-medium ${cfg.badgeClass}`}
                              >
                                {cfg.label}
                              </Badge>
                            )
                          })}
                        </div>

                        {/* Message */}
                        {inq.message && (
                          <p className="rounded bg-muted/40 p-2 text-foreground/80 italic text-[11px]">
                            &ldquo;{inq.message}&rdquo;
                          </p>
                        )}

                        {/* Quick Contact Buttons & Status update */}
                        <div className="flex items-center justify-between pt-1 border-t border-border/40">
                          <div className="flex items-center gap-1.5">
                            <Button
                              asChild
                              size="sm"
                              className="h-7 text-[11px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
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
                              className="h-7 text-[11px] px-2 gap-1"
                            >
                              <a href={mailUrl}>
                                <Mail className="size-3" />
                                Email
                              </a>
                            </Button>
                          </div>

                          <div className="flex items-center gap-1">
                            {inq.status !== "connected" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  onInquiryStatusChange?.(inq.id, "connected")
                                  updateInquiryStatusAction(inq.id, "connected")
                                  toast.success("Inquiry marked as connected.")
                                }}
                              >
                                Mark Connected
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="p-4 border-t bg-background flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1.5"
                onClick={() => setEditDialogOpen(true)}
              >
                <Pencil className="size-3.5" />
                Edit Project
              </Button>

              {project.status !== "completed" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer text-xs"
                  onClick={() =>
                    handleStatusChange(project.status === "active" ? "funded" : "completed")
                  }
                  disabled={pending}
                >
                  {project.status === "active" ? "Mark 100% Funded" : "Mark Completed"}
                </Button>
              )}
            </div>

            <Button
              variant="destructive"
              size="sm"
              className="cursor-pointer gap-1.5"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={pending}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{project.title}</strong> and remove it from the
              Hello Linden mobile app. Associated resident inquiries will be unlinked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Form Dialog */}
      <ProjectFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        project={project}
        onSuccess={() => {
          onProjectUpdated?.()
        }}
      />
    </>
  )
}
