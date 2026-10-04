import { Mail } from "./components/mail"
import { accounts, type Mail as MailType } from "./data"
import { getMailThreads, getMailCounts, type MailThreadWithMessages } from "@/lib/mail"
import { REGISTRATION_ROLES } from "@/lib/registrations"

function threadToMail(thread: MailThreadWithMessages): MailType {
  const initialOrFirst = thread.messages && thread.messages.length > 0 ? thread.messages[0] : null;
  const lastMessage = thread.messages && thread.messages.length > 0 ? thread.messages[thread.messages.length - 1] : null;
  const bodyText = lastMessage?.body_text || initialOrFirst?.body_text || "";

  const roleObj = REGISTRATION_ROLES.find((r) => r.id === thread.category);
  const roleLabel = roleObj?.label ?? (thread.category ? thread.category.replace(/_/g, " ") : "Inquiry");

  const labels: string[] = [roleLabel];

  return {
    id: thread.id,
    name: thread.sender_name || thread.sender_email,
    email: thread.sender_email,
    subject: thread.subject,
    text: bodyText,
    date: thread.last_message_at || thread.created_at,
    read: thread.status !== "unread",
    labels,
    category: thread.category,
    status: thread.status,
    is_starred: Boolean(thread.is_starred),
    is_archived: Boolean(thread.is_archived),
    is_trashed: Boolean(thread.is_trashed),
    snoozed_until: thread.snoozed_until,
    registration_id: thread.registration_id,
    messages: thread.messages || [],
  };
}

export default async function MailPage() {
  const [threads, counts] = await Promise.all([
    getMailThreads({ folder: "all" }),
    getMailCounts(),
  ]);

  const realMails: MailType[] = threads.map(threadToMail);

  return (
    <div className="h-[calc(100vh-8rem)]">
      <Mail
        accounts={accounts}
        mails={realMails}
        registrationCounts={counts.categories}
      />
    </div>
  );
}

