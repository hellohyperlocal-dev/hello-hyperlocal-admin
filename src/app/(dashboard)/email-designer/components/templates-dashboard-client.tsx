"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EmailDesignerTemplateRecord,
  EmailDocument,
} from "@/lib/email-designer/types";
import { STARTER_TEMPLATES } from "@/lib/email-designer/presets";
import {
  saveDesignerTemplateAction,
  duplicateDesignerTemplateAction,
  deleteDesignerTemplateAction,
} from "@/lib/email-designer/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Send,
  Sparkles,
  FilePlus,
  Mail,
  Calendar,
  ArrowRight,
  Store,
  Newspaper,
  Megaphone,
} from "lucide-react";
import { toast } from "sonner";
import { TestEmailDialog } from "./test-email-dialog";

interface Props {
  initialTemplates: EmailDesignerTemplateRecord[];
}

export function TemplatesDashboardClient({ initialTemplates }: Props) {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailDesignerTemplateRecord[]>(initialTemplates);
  const [search, setSearch] = useState("");
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [activeTestTemplate, setActiveTestTemplate] = useState<EmailDesignerTemplateRecord | null>(null);

  // Group 1: Blank Starter
  const blankStarter = STARTER_TEMPLATES.find((s) => s.id === "starter-blank") || STARTER_TEMPLATES[0];

  // Group 2: Ready-to-use Design Templates
  const designTemplates = STARTER_TEMPLATES.filter((s) => s.id !== "starter-blank");

  const filtered = templates.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.subject && t.subject.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q))
    );
  });

  const handleCreateFromStarter = async (starter: EmailDocument) => {
    const newId = `tmpl_${Date.now()}`;
    const newDoc: EmailDocument = {
      ...starter,
      id: newId,
      name: starter.name === "Blank Canvas" ? "Untitled Email" : `${starter.name}`,
    };

    const res = await saveDesignerTemplateAction(newDoc);
    if (res.success) {
      toast.success(
        starter.name === "Blank Canvas"
          ? "Opened fresh blank email!"
          : `Started new email from "${starter.name}"!`
      );
      router.push(`/email-designer/${newId}`);
    } else {
      toast.error(res.error || "Failed to create email");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await duplicateDesignerTemplateAction(id);
      if (res.success && res.newId) {
        toast.success("Email duplicated!");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to duplicate");
      }
    } catch {
      toast.error("Failed to duplicate email");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await deleteDesignerTemplateAction(id);
      if (res.success) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        toast.success("Email deleted.");
      } else {
        toast.error(res.error || "Failed to delete email");
      }
    } catch {
      toast.error("Failed to delete email");
    }
  };

  const getTemplateIcon = (category?: string) => {
    switch (category) {
      case "business":
        return <Store className="size-4 text-[#7ED957]" />;
      case "notice":
        return <Megaphone className="size-4 text-[#7ED957]" />;
      case "newsletter":
      default:
        return <Newspaper className="size-4 text-[#7ED957]" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <span>Email Designer</span>
          <Badge variant="outline" className="text-xs bg-primary/10 text-[#1C472A] border-primary/20">
            Studio
          </Badge>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create, customize, and publish beautiful emails and newsletters for Hello Linden.
        </p>
      </div>

      {/* TWO QUICK-START GROUPS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* GROUP 1: Start With A Blank Email */}
        <div className="lg:col-span-4 flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
            <FilePlus className="size-3.5 text-primary" />
            Start With A Blank Email
          </span>

          <div
            onClick={() => handleCreateFromStarter(blankStarter)}
            className="flex-1 p-6 rounded-2xl border-2 border-dashed border-[#1C472A]/30 bg-primary/5 hover:bg-primary/10 hover:border-[#1C472A] transition-all cursor-pointer flex flex-col justify-between group shadow-2xs hover:shadow-xs min-h-[220px]"
          >
            <div>
              <div className="size-11 rounded-xl bg-[#1C472A] text-white flex items-center justify-center mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                <Plus className="size-6 text-[#7ED957]" />
              </div>
              <h3 className="text-base font-bold text-foreground group-hover:text-[#1C472A] transition-colors">
                Start From Scratch
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Open a clean, empty canvas and add your headlines, text, photos, and buttons row-by-row.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-primary/20 flex items-center justify-between text-xs font-semibold text-[#1C472A]">
              <span>Create blank email</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* GROUP 2: ...Or Start With A Template */}
        <div className="lg:col-span-8 flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            ...Or Start With A Template
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 flex-1">
            {designTemplates.map((starter) => (
              <div
                key={starter.id}
                onClick={() => handleCreateFromStarter(starter)}
                className="p-4 rounded-xl border bg-card hover:border-[#1C472A] hover:bg-primary/5 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="size-7 rounded-lg bg-[#1C472A] flex items-center justify-center shadow-2xs">
                      {getTemplateIcon(starter.category)}
                    </div>
                    <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                      {starter.category}
                    </Badge>
                  </div>

                  <h4 className="text-sm font-bold text-foreground group-hover:text-[#1C472A] transition-colors">
                    {starter.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {starter.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs font-medium text-foreground group-hover:text-[#1C472A]">
                  <span className="text-[11px] font-semibold">Use template</span>
                  <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION: Your Saved Emails */}
      <div className="pt-6 border-t space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-foreground">Your Saved Emails</h2>
            <Badge variant="secondary" className="text-xs font-medium">
              {templates.length}
            </Badge>
          </div>

          {templates.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search saved emails by title or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          )}
        </div>

        {/* Saved Emails Cards Grid */}
        {templates.length === 0 ? (
          <Card className="p-10 text-center border-dashed bg-muted/10">
            <Mail className="size-9 text-muted-foreground/40 mx-auto mb-2.5" />
            <h3 className="text-sm font-semibold text-foreground">No saved emails yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Your customized email drafts will appear here once you create or edit an email above.
            </p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-xs text-muted-foreground">
              No saved emails match your search query &quot;{search}&quot;.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <Card
                key={t.id}
                className="flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow border-border/80 group"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Badge variant="secondary" className="text-[10px] uppercase font-semibold mb-1.5">
                        {t.category || "General"}
                      </Badge>
                      <CardTitle className="text-base font-bold truncate group-hover:text-[#1C472A] transition-colors">
                        <Link href={`/email-designer/${t.id}`}>
                          {t.name || "Untitled Email"}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-xs truncate mt-0.5">
                        {t.subject || "No subject line set"}
                      </CardDescription>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7 -mr-1">
                          <MoreVertical className="size-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem asChild className="gap-2 text-xs">
                          <Link href={`/email-designer/${t.id}`}>
                            <Pencil className="size-3.5 text-muted-foreground" />
                            Open in Studio
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="gap-2 text-xs font-semibold text-[#1C472A] focus:text-[#1C472A] focus:bg-primary/10">
                          <Link href={`/mail?compose=true&templateId=${t.id}`}>
                            <Send className="size-3.5 text-[#1C472A]" />
                            Use in Mail App
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(t.id)}
                          className="gap-2 text-xs"
                        >
                          <Copy className="size-3.5 text-muted-foreground" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setActiveTestTemplate(t);
                            setTestDialogOpen(true);
                          }}
                          className="gap-2 text-xs"
                        >
                          <Send className="size-3.5 text-muted-foreground" />
                          Send Test Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(t.id, t.name)}
                          className="gap-2 text-xs text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="p-4 py-2">
                  <div className="h-24 rounded-lg border bg-muted/20 p-3 overflow-hidden flex flex-col justify-center items-center text-center relative pointer-events-none select-none">
                    <div className="w-full max-w-[200px] bg-white shadow-2xs border rounded p-2 text-left space-y-1">
                      <div className="h-2 bg-[#1C472A] rounded-xs w-3/4" />
                      <div className="h-1 bg-muted-foreground/30 rounded-xs w-full" />
                      <div className="h-1 bg-muted-foreground/20 rounded-xs w-2/3" />
                      <div className="h-2 bg-[#7ED957] rounded-xs w-1/3 mt-1.5" />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-2 border-t flex items-center justify-between text-xs text-muted-foreground bg-muted/5">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="size-3 text-muted-foreground" />
                    {new Date(t.updated_at).toLocaleDateString("en-ZA", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-7 text-xs gap-1 border-primary/20 text-[#1C472A] hover:bg-primary/10 hover:text-[#1C472A]"
                    >
                      <Link href={`/mail?compose=true&templateId=${t.id}`}>
                        <Send className="size-3 text-[#1C472A]" />
                        Use in Mail
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-7 text-xs gap-1 group-hover:border-[#1C472A] group-hover:text-[#1C472A]"
                    >
                      <Link href={`/email-designer/${t.id}`}>
                        Edit
                        <ArrowRight className="size-3" />
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Test Email Dialog */}
      {activeTestTemplate && (
        <TestEmailDialog
          open={testDialogOpen}
          onOpenChange={(open) => {
            setTestDialogOpen(open);
            if (!open) setActiveTestTemplate(null);
          }}
          subject={activeTestTemplate.subject}
          compiledHtml={activeTestTemplate.html_content}
        />
      )}
    </div>
  );
}
