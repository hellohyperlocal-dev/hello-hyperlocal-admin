"use client"

import * as React from "react"
import {
  Archive,
  ArchiveX,
  File,
  Handshake,
  HelpCircle,
  Inbox,
  Search,
  Send,
  Store,
  Trash2,
  Users,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AccountSwitcher } from "./account-switcher"
import { MailDisplay } from "./mail-display"
import { MailList } from "./mail-list"
import { Nav } from "./nav"
import { type Mail } from "../data"
import { useMail } from "../use-mail"
import { Button } from "@/components/ui/button"

interface MailProps {
  accounts: {
    label: string;
    email: string;
    icon: React.ReactNode;
  }[];
  mails: Mail[];
  registrationCounts?: {
    founding_neighbour?: number;
    founding_business?: number;
    partner_interest?: number;
    general_enquiry?: number;
  };
}

const folderTitles: Record<string, string> = {
  inbox: "Inbox",
  drafts: "Drafts",
  sent: "Sent",
  junk: "Junk",
  trash: "Trash",
  archive: "Archive",
  founding_neighbour: "Founding Neighbours",
  founding_business: "Founding Businesses",
  partner_interest: "Partner Interest",
  general_enquiry: "General Enquiries",
};

export function Mail({
  accounts,
  mails,
  registrationCounts,
}: MailProps) {
  const [mail, setMail] = useMail();
  const [selectedFolder, setSelectedFolder] = React.useState<string>("inbox");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const filteredMails = React.useMemo(() => {
    let list = mails;
    if (selectedFolder === "inbox") {
      list = mails;
    } else if (
      selectedFolder === "founding_neighbour" ||
      selectedFolder === "founding_business" ||
      selectedFolder === "partner_interest" ||
      selectedFolder === "general_enquiry"
    ) {
      list = mails.filter((m) => m.category === selectedFolder);
    } else {
      list = [];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.text.toLowerCase().includes(q) ||
          m.labels.some((l) => l.toLowerCase().includes(q))
      );
    }

    return list;
  }, [mails, selectedFolder, searchQuery]);

  React.useEffect(() => {
    if (!mail.selected && filteredMails.length > 0) {
      setMail({ selected: filteredMails[0].id });
    }
  }, [filteredMails, mail.selected, setMail]);

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolder(folderId);
    let nextList = mails;
    if (folderId === "inbox") {
      nextList = mails;
    } else if (
      folderId === "founding_neighbour" ||
      folderId === "founding_business" ||
      folderId === "partner_interest" ||
      folderId === "general_enquiry"
    ) {
      nextList = mails.filter((m) => m.category === folderId);
    } else {
      nextList = [];
    }
    setMail({ selected: nextList[0]?.id ?? null });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        orientation="horizontal"
        className="h-full items-stretch rounded-lg border overflow-hidden"
      >
        <ResizablePanel defaultSize="20%" minSize="15%" maxSize="35%">
          <div className="flex h-[52px] items-center px-2">
            <AccountSwitcher isCollapsed={false} accounts={accounts} />
          </div>
          <Separator className="mx-0" />
          <div className="m-3">
            <Button className="w-full cursor-pointer">
              Compose
              <Send className="size-4" />
            </Button>
          </div>
          <Separator className="mx-0" />
          <Nav
            isCollapsed={false}
            links={[
              {
                title: "Inbox",
                label: mails.length > 0 ? String(mails.length) : "",
                icon: Inbox,
                variant: selectedFolder === "inbox" ? "default" : "ghost",
                onClick: () => handleSelectFolder("inbox"),
              },
              {
                title: "Drafts",
                label: "",
                icon: File,
                variant: selectedFolder === "drafts" ? "default" : "ghost",
                onClick: () => handleSelectFolder("drafts"),
              },
              {
                title: "Sent",
                label: "",
                icon: Send,
                variant: selectedFolder === "sent" ? "default" : "ghost",
                onClick: () => handleSelectFolder("sent"),
              },
              {
                title: "Junk",
                label: "",
                icon: ArchiveX,
                variant: selectedFolder === "junk" ? "default" : "ghost",
                onClick: () => handleSelectFolder("junk"),
              },
              {
                title: "Trash",
                label: "",
                icon: Trash2,
                variant: selectedFolder === "trash" ? "default" : "ghost",
                onClick: () => handleSelectFolder("trash"),
              },
              {
                title: "Archive",
                label: "",
                icon: Archive,
                variant: selectedFolder === "archive" ? "default" : "ghost",
                onClick: () => handleSelectFolder("archive"),
              },
            ]}
          />
          <Separator className="mx-0" />
          <Nav
            isCollapsed={false}
            links={[
              {
                title: "Founding Neighbours",
                label: registrationCounts?.founding_neighbour ? String(registrationCounts.founding_neighbour) : "",
                icon: Users,
                variant: selectedFolder === "founding_neighbour" ? "default" : "ghost",
                onClick: () => handleSelectFolder("founding_neighbour"),
              },
              {
                title: "Founding Businesses",
                label: registrationCounts?.founding_business ? String(registrationCounts.founding_business) : "",
                icon: Store,
                variant: selectedFolder === "founding_business" ? "default" : "ghost",
                onClick: () => handleSelectFolder("founding_business"),
              },
              {
                title: "Partner Interest",
                label: registrationCounts?.partner_interest ? String(registrationCounts.partner_interest) : "",
                icon: Handshake,
                variant: selectedFolder === "partner_interest" ? "default" : "ghost",
                onClick: () => handleSelectFolder("partner_interest"),
              },
              {
                title: "General Enquiries",
                label: registrationCounts?.general_enquiry ? String(registrationCounts.general_enquiry) : "",
                icon: HelpCircle,
                variant: selectedFolder === "general_enquiry" ? "default" : "ghost",
                onClick: () => handleSelectFolder("general_enquiry"),
              },
            ]}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="32%" minSize="25%">
          <Tabs defaultValue="all" className="gap-1">
            <div className="flex items-center px-4 py-1.5">
              <h1 className="text-foreground text-xl font-bold">
                {folderTitles[selectedFolder] ?? "Inbox"}
              </h1>
              <TabsList className="ml-auto">
                <TabsTrigger value="all" className="cursor-pointer">All mail</TabsTrigger>
                <TabsTrigger value="unread" className="cursor-pointer">Unread</TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 p-4 backdrop-blur">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-2.5 left-2 size-4 cursor-pointer" />
                  <Input
                    placeholder="Search"
                    className="pl-8 cursor-text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <MailList items={filteredMails} />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <MailList items={filteredMails.filter((item) => !item.read)} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="48%" minSize="30%">
          <MailDisplay mail={mails.find((item) => item.id === mail.selected) || null} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
