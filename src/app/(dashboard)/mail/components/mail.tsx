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
import { type Mail, type Account } from "../data"
import { useMail } from "../use-mail"
import { Button } from "@/components/ui/button"
import { updateThreadStateAction } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { MailComposeDialog } from "./mail-compose-dialog"

interface MailProps {
  accounts: Account[];
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
  mails: initialMails,
}: MailProps) {
  const router = useRouter();
  const [mail, setMail] = useMail();
  const [mailList, setMailList] = React.useState<Mail[]>(initialMails);
  const [selectedAccount, setSelectedAccount] = React.useState<Account>(accounts[0]);
  const [selectedFolder, setSelectedFolder] = React.useState<string>("inbox");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [composeOpen, setComposeOpen] = React.useState<boolean>(false);

  // Sync if initialMails changes from server revalidation
  React.useEffect(() => {
    setMailList(initialMails);
  }, [initialMails]);

  // Compute live folder counts
  const folderCounts = React.useMemo(() => {
    let inbox = 0;
    let sent = 0;
    let trash = 0;
    let archive = 0;
    let founding_neighbour = 0;
    let founding_business = 0;
    let partner_interest = 0;
    let general_enquiry = 0;

    mailList.forEach((m) => {
      if (m.is_trashed) {
        trash++;
      } else if (m.is_archived) {
        archive++;
      } else {
        inbox++;
        if (m.category === "founding_neighbour") founding_neighbour++;
        else if (m.category === "founding_business") founding_business++;
        else if (m.category === "partner_interest") partner_interest++;
        else if (m.category === "general_enquiry") general_enquiry++;
      }

      if (!m.is_trashed && m.status === "replied") {
        sent++;
      }
    });

    return {
      inbox,
      sent,
      trash,
      archive,
      drafts: 0,
      junk: 0,
      categories: {
        founding_neighbour,
        founding_business,
        partner_interest,
        general_enquiry,
      },
    };
  }, [mailList]);

  const filteredMails = React.useMemo(() => {
    let list: Mail[] = [];

    if (selectedFolder === "inbox") {
      list = mailList.filter((m) => !m.is_trashed && !m.is_archived);
    } else if (selectedFolder === "sent") {
      list = mailList.filter((m) => !m.is_trashed && m.status === "replied");
    } else if (selectedFolder === "archive") {
      list = mailList.filter((m) => !m.is_trashed && m.is_archived);
    } else if (selectedFolder === "trash") {
      list = mailList.filter((m) => Boolean(m.is_trashed));
    } else if (selectedFolder === "drafts" || selectedFolder === "junk") {
      list = [];
    } else if (
      selectedFolder === "founding_neighbour" ||
      selectedFolder === "founding_business" ||
      selectedFolder === "partner_interest" ||
      selectedFolder === "general_enquiry"
    ) {
      list = mailList.filter(
        (m) => !m.is_trashed && !m.is_archived && m.category === selectedFolder
      );
    } else {
      list = mailList;
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
  }, [mailList, selectedFolder, searchQuery]);

  React.useEffect(() => {
    if (!mail.selected && filteredMails.length > 0) {
      setMail({ selected: filteredMails[0].id });
    }
  }, [filteredMails, mail.selected, setMail]);

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolder(folderId);
    let nextList: Mail[] = [];
    if (folderId === "inbox") {
      nextList = mailList.filter((m) => !m.is_trashed && !m.is_archived);
    } else if (folderId === "sent") {
      nextList = mailList.filter((m) => !m.is_trashed && m.status === "replied");
    } else if (folderId === "archive") {
      nextList = mailList.filter((m) => !m.is_trashed && m.is_archived);
    } else if (folderId === "trash") {
      nextList = mailList.filter((m) => Boolean(m.is_trashed));
    } else if (
      folderId === "founding_neighbour" ||
      folderId === "founding_business" ||
      folderId === "partner_interest" ||
      folderId === "general_enquiry"
    ) {
      nextList = mailList.filter(
        (m) => !m.is_trashed && !m.is_archived && m.category === folderId
      );
    }
    setMail({ selected: nextList[0]?.id ?? null });
  };

  const handleThreadUpdated = (updatedMail: Mail) => {
    setMailList((prev) =>
      prev.map((m) => (m.id === updatedMail.id ? { ...m, ...updatedMail } : m))
    );
  };

  const handleThreadRemoved = (threadId: string) => {
    setMailList((prev) =>
      prev.map((m) => {
        if (m.id === threadId) {
          if (selectedFolder === "archive") {
            return { ...m, is_archived: false };
          }
          if (selectedFolder === "trash") {
            return { ...m, is_trashed: false };
          }
          return { ...m, is_archived: true };
        }
        return m;
      })
    );
  };

  const handleToggleStar = async (threadId: string, currentStarred: boolean) => {
    const next = !currentStarred;
    setMailList((prev) =>
      prev.map((m) => (m.id === threadId ? { ...m, is_starred: next } : m))
    );
    await updateThreadStateAction(threadId, { is_starred: next });
    toast.success(next ? "Starred" : "Unstarred");
  };

  const currentSelectedMail = mailList.find((item) => item.id === mail.selected) || null;

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        orientation="horizontal"
        className="h-full items-stretch rounded-lg border overflow-hidden"
      >
        <ResizablePanel defaultSize="20%" minSize="15%" maxSize="35%">
          <div className="flex h-[52px] items-center px-2">
            <AccountSwitcher
              isCollapsed={false}
              accounts={accounts}
              selectedEmail={selectedAccount.email}
              onSelectAccount={(acc) => setSelectedAccount(acc)}
            />
          </div>
          <Separator className="mx-0" />
          <div className="m-3">
            <Button
              className="w-full cursor-pointer"
              onClick={() => setComposeOpen(true)}
            >
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
                label: folderCounts.inbox > 0 ? String(folderCounts.inbox) : "",
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
                label: folderCounts.sent > 0 ? String(folderCounts.sent) : "",
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
                label: folderCounts.trash > 0 ? String(folderCounts.trash) : "",
                icon: Trash2,
                variant: selectedFolder === "trash" ? "default" : "ghost",
                onClick: () => handleSelectFolder("trash"),
              },
              {
                title: "Archive",
                label: folderCounts.archive > 0 ? String(folderCounts.archive) : "",
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
                label: folderCounts.categories.founding_neighbour > 0 ? String(folderCounts.categories.founding_neighbour) : "",
                icon: Users,
                variant: selectedFolder === "founding_neighbour" ? "default" : "ghost",
                onClick: () => handleSelectFolder("founding_neighbour"),
              },
              {
                title: "Founding Businesses",
                label: folderCounts.categories.founding_business > 0 ? String(folderCounts.categories.founding_business) : "",
                icon: Store,
                variant: selectedFolder === "founding_business" ? "default" : "ghost",
                onClick: () => handleSelectFolder("founding_business"),
              },
              {
                title: "Partner Interest",
                label: folderCounts.categories.partner_interest > 0 ? String(folderCounts.categories.partner_interest) : "",
                icon: Handshake,
                variant: selectedFolder === "partner_interest" ? "default" : "ghost",
                onClick: () => handleSelectFolder("partner_interest"),
              },
              {
                title: "General Enquiries",
                label: folderCounts.categories.general_enquiry > 0 ? String(folderCounts.categories.general_enquiry) : "",
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
              <MailList items={filteredMails} onToggleStar={handleToggleStar} />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <MailList
                items={filteredMails.filter((item) => !item.read || item.status === "unread")}
                onToggleStar={handleToggleStar}
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="48%" minSize="30%">
          <MailDisplay
            mail={currentSelectedMail}
            activeAccount={selectedAccount}
            onThreadUpdated={handleThreadUpdated}
            onThreadRemoved={handleThreadRemoved}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <MailComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        accounts={accounts}
        defaultFromEmail={selectedAccount.email}
        onThreadCreated={(newThreadId) => {
          setMail({ selected: newThreadId });
          router.refresh();
        }}
      />
    </TooltipProvider>
  );
}

