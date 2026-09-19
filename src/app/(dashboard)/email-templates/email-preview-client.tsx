"use client";

import { useState, useTransition, useMemo } from "react";
import { EMAIL_TEMPLATES } from "@/lib/email-templates/templates";
import { EmailCategory } from "@/lib/email-templates/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MonitorIcon,
  SmartphoneIcon,
  SendIcon,
  CopyIcon,
  CheckIcon,
  RotateCcwIcon,
  MailIcon,
  SparklesIcon,
  ShieldIcon,
  UserPlusIcon,
  FlagIcon,
  MegaphoneIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";
import { sendTestEmailAction } from "./actions";

interface Props {
  adminEmail: string;
}

const CATEGORY_ICONS: Record<EmailCategory, React.ReactNode> = {
  invites: <UserPlusIcon className="size-3.5" />,
  security: <ShieldIcon className="size-3.5" />,
  moderation: <FlagIcon className="size-3.5" />,
  municipal: <MegaphoneIcon className="size-3.5" />,
  community: <UsersIcon className="size-3.5" />,
};

export function EmailPreviewClient({ adminEmail }: Props) {
  const [selectedId, setSelectedId] = useState<string>(EMAIL_TEMPLATES[0].id);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [testEmail, setTestEmail] = useState(adminEmail || "");
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const selectedTemplate = useMemo(
    () => EMAIL_TEMPLATES.find((t) => t.id === selectedId) || EMAIL_TEMPLATES[0],
    [selectedId]
  );

  // Maintain variables state per template
  const [variablesState, setVariablesState] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    for (const t of EMAIL_TEMPLATES) {
      initial[t.id] = {};
      for (const v of t.variables) {
        initial[t.id][v.key] = v.defaultValue;
      }
    }
    return initial;
  });

  const currentVariables = useMemo(
    () => variablesState[selectedTemplate.id] || {},
    [variablesState, selectedTemplate.id]
  );

  const handleVariableChange = (key: string, value: string) => {
    setVariablesState((prev) => ({
      ...prev,
      [selectedTemplate.id]: {
        ...prev[selectedTemplate.id],
        [key]: value,
      },
    }));
  };

  const resetVariables = () => {
    const defaults: Record<string, string> = {};
    for (const v of selectedTemplate.variables) {
      defaults[v.key] = v.defaultValue;
    }
    setVariablesState((prev) => ({
      ...prev,
      [selectedTemplate.id]: defaults,
    }));
    toast.success("Variables reset to template defaults.");
  };

  const compiledHtml = useMemo(
    () => selectedTemplate.renderHtml(currentVariables),
    [selectedTemplate, currentVariables]
  );

  const compiledPlainText = useMemo(
    () => selectedTemplate.renderPlainText(currentVariables),
    [selectedTemplate, currentVariables]
  );

  const copyCode = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTest = () => {
    if (!testEmail || !testEmail.includes("@")) {
      toast.error("Please enter a valid destination email address.");
      return;
    }

    startTransition(async () => {
      const res = await sendTestEmailAction({
        templateId: selectedTemplate.id,
        toEmail: testEmail,
        variables: currentVariables,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Test email sent to ${testEmail}! Check your inbox.`);
        setTestDialogOpen(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground">Email Notifications &amp; Templates</h1>
            <Badge variant="outline" className="gap-1 border-primary/40 bg-primary/5 text-primary text-xs">
              <SparklesIcon className="size-3" />
              Live Preview
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Preview, customize, and test responsive transactional email notifications styled with Hello Hyperlocal branding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <SendIcon className="size-4" />
                Send Test Email
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Send Test Email</DialogTitle>
                <DialogDescription>
                  Send a live test of <strong>{selectedTemplate.title}</strong> directly to an email address via Resend.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="testEmail">Recipient Email Address</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="you@hellolinden.co.za"
                  />
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Subject Line:</p>
                  <p className="italic">[TEST] {selectedTemplate.defaultSubject}</p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendTest} disabled={pending}>
                  {pending ? "Sending…" : "Send Test"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Template Selector & Dynamic Variables (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Template Picker */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Available Templates</CardTitle>
              <CardDescription className="text-xs">
                Select a template to inspect layout and variables
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
              {EMAIL_TEMPLATES.map((tpl) => {
                const isSelected = tpl.id === selectedId;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedId(tpl.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-primary/10 text-foreground font-semibold border border-primary/30"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-primary shrink-0">{CATEGORY_ICONS[tpl.category]}</span>
                      <span className="truncate">{tpl.title}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] uppercase font-mono py-0 shrink-0">
                      {tpl.category}
                    </Badge>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Variables Inspector */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Template Variables</CardTitle>
                <CardDescription className="text-xs">
                  Edit variables to preview dynamic content
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={resetVariables}
                title="Reset to defaults"
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcwIcon className="size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-0">
              {selectedTemplate.variables.map((v) => (
                <div key={v.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={v.key} className="text-xs font-medium">
                      {v.label}
                    </Label>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {"{{" + v.key + "}}"}
                    </span>
                  </div>
                  {v.type === "textarea" ? (
                    <Textarea
                      id={v.key}
                      rows={3}
                      className="text-xs resize-y"
                      value={currentVariables[v.key] ?? ""}
                      onChange={(e) => handleVariableChange(v.key, e.target.value)}
                    />
                  ) : (
                    <Input
                      id={v.key}
                      type={v.type === "number" ? "number" : "text"}
                      className="h-8 text-xs"
                      value={currentVariables[v.key] ?? ""}
                      onChange={(e) => handleVariableChange(v.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preview Canvas & Code Viewer (8 cols) */}
        <div className="space-y-4 lg:col-span-8">
          <Card className="flex flex-col h-full">
            {/* Canvas Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-3.5 bg-muted/20">
              {/* Tabs: Visual / HTML / Text */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="h-8">
                  <TabsTrigger value="preview" className="text-xs gap-1.5">
                    <MailIcon className="size-3.5" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="html" className="text-xs">
                    HTML Code
                  </TabsTrigger>
                  <TabsTrigger value="text" className="text-xs">
                    Plain Text
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Viewport Toggles (Active when in Preview tab) */}
              <div className="flex items-center gap-2">
                {activeTab === "preview" && (
                  <div className="flex items-center rounded-lg border border-border bg-background p-0.5">
                    <Button
                      variant={viewport === "desktop" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-7 px-2.5 text-xs gap-1"
                      onClick={() => setViewport("desktop")}
                    >
                      <MonitorIcon className="size-3.5" />
                      Desktop
                    </Button>
                    <Button
                      variant={viewport === "mobile" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-7 px-2.5 text-xs gap-1"
                      onClick={() => setViewport("mobile")}
                    >
                      <SmartphoneIcon className="size-3.5" />
                      Mobile (375px)
                    </Button>
                  </div>
                )}

                {activeTab === "html" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    onClick={() => copyCode(compiledHtml)}
                  >
                    {copied ? <CheckIcon className="size-3.5 text-positive" /> : <CopyIcon className="size-3.5" />}
                    Copy HTML
                  </Button>
                )}

                {activeTab === "text" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    onClick={() => copyCode(compiledPlainText)}
                  >
                    {copied ? <CheckIcon className="size-3.5 text-positive" /> : <CopyIcon className="size-3.5" />}
                    Copy Text
                  </Button>
                )}
              </div>
            </div>

            {/* Canvas Body */}
            <CardContent className="p-4 flex-1 flex flex-col justify-center items-center bg-muted/40 min-h-[620px]">
              {activeTab === "preview" && (
                <div
                  className={`transition-all duration-300 w-full flex justify-center ${
                    viewport === "mobile" ? "max-w-[395px]" : "max-w-[640px]"
                  }`}
                >
                  <div
                    className={`w-full bg-white shadow-md border border-border overflow-hidden transition-all ${
                      viewport === "mobile"
                        ? "rounded-[32px] p-2.5 border-4 border-slate-700 shadow-2xl"
                        : "rounded-xl"
                    }`}
                  >
                    {viewport === "mobile" && (
                      <div className="mx-auto mb-2 h-4 w-28 rounded-full bg-slate-700" />
                    )}
                    <iframe
                      title="Email Preview"
                      srcDoc={compiledHtml}
                      className="w-full h-[620px] rounded-lg border-0 bg-white"
                    />
                  </div>
                </div>
              )}

              {activeTab === "html" && (
                <div className="w-full h-[620px] flex flex-col">
                  <pre className="flex-1 w-full overflow-auto rounded-lg border border-border bg-background p-4 text-xs font-mono text-foreground select-all leading-relaxed">
                    {compiledHtml}
                  </pre>
                </div>
              )}

              {activeTab === "text" && (
                <div className="w-full h-[620px] flex flex-col">
                  <pre className="flex-1 w-full overflow-auto rounded-lg border border-border bg-background p-4 text-xs font-mono text-foreground select-all leading-relaxed whitespace-pre-wrap">
                    {compiledPlainText}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
