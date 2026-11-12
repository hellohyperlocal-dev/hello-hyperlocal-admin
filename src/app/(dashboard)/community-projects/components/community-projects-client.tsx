"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProjectStatCards, type ProjectStatCounts } from "./project-stat-cards"
import { ProjectDataTable } from "./project-data-table"
import { InquiriesDataTable } from "./inquiries-data-table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { HeartHandshake, MessageSquareText } from "lucide-react"
import type {
  CommunityProject,
  CommunityProjectInquiry,
  InquiryStatus,
} from "@/lib/community-projects-types"

interface CommunityProjectsClientProps {
  initialProjects: CommunityProject[]
  initialInquiries: CommunityProjectInquiry[]
}

export function CommunityProjectsClient({
  initialProjects,
  initialInquiries,
}: CommunityProjectsClientProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<CommunityProject[]>(initialProjects)
  const [inquiries, setInquiries] = useState<CommunityProjectInquiry[]>(initialInquiries)

  const handleRefresh = () => {
    router.refresh()
  }

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  const handleDeleteInquiry = (id: string) => {
    setInquiries((prev) => prev.filter((i) => i.id !== id))
  }

  const handleInquiryStatusChange = (id: string, newStatus: InquiryStatus) => {
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    )
  }

  const counts: ProjectStatCounts = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "active").length,
    totalTarget: projects.reduce((sum, p) => sum + (Number(p.target_amount) || 0), 0),
    totalRaised: projects.reduce((sum, p) => sum + (Number(p.current_amount_raised) || 0), 0),
    totalInquiries: inquiries.length,
    newInquiries: inquiries.filter((i) => i.status === "new").length,
    totalSupporters: projects.reduce((sum, p) => sum + (Number(p.pledges_count) || 0), 0),
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 4 Responsive Stat Cards */}
      <div className="@container/main">
        <ProjectStatCards counts={counts} />
      </div>

      {/* Main TanStack Data Tables Section */}
      <div className="@container/main mt-6 lg:mt-8">
        <Tabs defaultValue="projects" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="bg-muted/60 p-1">
              <TabsTrigger value="projects" className="gap-2 cursor-pointer">
                <HeartHandshake className="size-4" />
                Projects ({projects.length})
              </TabsTrigger>
              <TabsTrigger value="inquiries" className="gap-2 cursor-pointer">
                <MessageSquareText className="size-4" />
                Resident Inquiries ({inquiries.length})
                {counts.newInquiries > 0 && (
                  <Badge className="ml-1 h-5 px-1.5 text-[10px] bg-amber-500 text-white border-none">
                    {counts.newInquiries} new
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="projects" className="m-0">
            <ProjectDataTable
              projects={projects}
              inquiries={inquiries}
              onUpdateProject={handleRefresh}
              onDeleteProject={handleDeleteProject}
              onInquiryStatusChange={handleInquiryStatusChange}
            />
          </TabsContent>

          <TabsContent value="inquiries" className="m-0">
            <InquiriesDataTable
              inquiries={inquiries}
              projects={projects}
              onStatusChange={handleInquiryStatusChange}
              onDeleteInquiry={handleDeleteInquiry}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
