import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface MailThreadRow {
  id: string;
  registration_id: string | null;
  subject: string;
  sender_name: string;
  sender_email: string;
  category: string;
  status: "unread" | "read" | "replied" | "closed";
  is_starred: boolean;
  is_archived: boolean;
  is_trashed: boolean;
  snoozed_until: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface MailMessageRow {
  id: string;
  thread_id: string;
  direction: "inbound" | "outbound";
  from_email: string;
  from_name: string;
  to_email: string;
  to_name: string;
  subject: string;
  body_text: string;
  body_html: string | null;
  template_id: string | null;
  sent_by_admin_id: string | null;
  created_at: string;
}

export interface MailThreadWithMessages extends MailThreadRow {
  messages: MailMessageRow[];
}

export interface MailFolderCounts {
  inbox: number;
  drafts: number;
  sent: number;
  junk: number;
  trash: number;
  archive: number;
  categories: {
    founding_neighbour: number;
    founding_business: number;
    partner_interest: number;
    general_enquiry: number;
  };
}

/**
 * Fetches mail threads based on selected folder and optional category/search filter.
 */
export async function getMailThreads(options: {
  folder?: string;
  category?: string;
  search?: string;
} = {}): Promise<MailThreadWithMessages[]> {
  const admin = createAdminClient();
  const folder = options.folder || "inbox";

  let query = admin
    .from("mail_threads")
    .select(`
      *,
      messages:mail_messages(*)
    `)
    .order("last_message_at", { ascending: false });

  // Folder filtering
  if (folder === "all") {
    // No folder filtering: fetch all threads
  } else if (folder === "trash") {
    query = query.eq("is_trashed", true);
  } else if (folder === "archive") {
    query = query.eq("is_archived", true).eq("is_trashed", false);
  } else if (folder === "sent") {
    // Has at least one outbound reply and not trashed
    query = query
      .eq("status", "replied")
      .eq("is_trashed", false);
  } else if (folder === "drafts" || folder === "junk") {
    // Currently 0 drafts/junk
    query = query.eq("id", "00000000-0000-0000-0000-000000000000");
  } else {
    // Default "inbox": not archived, not trashed
    query = query
      .eq("is_archived", false)
      .eq("is_trashed", false);
  }

  // Category filtering
  if (options.category) {
    query = query.eq("category", options.category);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching mail threads:", error);
    return [];
  }

  let threads = (data || []) as unknown as MailThreadWithMessages[];

  // Sort child messages chronologically within each thread
  threads.forEach((t) => {
    if (t.messages && Array.isArray(t.messages)) {
      t.messages.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
  });

  // Client-side search if provided
  if (options.search) {
    const s = options.search.toLowerCase();
    threads = threads.filter(
      (t) =>
        t.subject.toLowerCase().includes(s) ||
        t.sender_name.toLowerCase().includes(s) ||
        t.sender_email.toLowerCase().includes(s) ||
        t.messages?.some(
          (m) =>
            m.body_text?.toLowerCase().includes(s) ||
            m.subject?.toLowerCase().includes(s)
        )
    );
  }

  return threads;
}

/**
 * Calculates counts for all mailbox folders and categories.
 */
export async function getMailCounts(): Promise<MailFolderCounts> {
  const admin = createAdminClient();

  const { data: threads, error } = await admin
    .from("mail_threads")
    .select("category, status, is_archived, is_trashed, is_starred");

  if (error || !threads) {
    return {
      inbox: 0,
      drafts: 0,
      sent: 0,
      junk: 0,
      trash: 0,
      archive: 0,
      categories: {
        founding_neighbour: 0,
        founding_business: 0,
        partner_interest: 0,
        general_enquiry: 0,
      },
    };
  }

  const counts: MailFolderCounts = {
    inbox: 0,
    drafts: 0,
    sent: 0,
    junk: 0,
    trash: 0,
    archive: 0,
    categories: {
      founding_neighbour: 0,
      founding_business: 0,
      partner_interest: 0,
      general_enquiry: 0,
    },
  };

  threads.forEach((t) => {
    if (t.is_trashed) {
      counts.trash++;
    } else if (t.is_archived) {
      counts.archive++;
    } else {
      counts.inbox++;

      if (t.category === "founding_neighbour") {
        counts.categories.founding_neighbour++;
      } else if (t.category === "founding_business") {
        counts.categories.founding_business++;
      } else if (t.category === "partner_interest") {
        counts.categories.partner_interest++;
      } else if (t.category === "general_enquiry") {
        counts.categories.general_enquiry++;
      }
    }

    if (!t.is_trashed && t.status === "replied") {
      counts.sent++;
    }
  });

  return counts;
}

/**
 * Fetches a single mail thread with all its chronological messages.
 */
export async function getMailThreadDetail(threadId: string): Promise<MailThreadWithMessages | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("mail_threads")
    .select(`
      *,
      messages:mail_messages(*)
    `)
    .eq("id", threadId)
    .single();

  if (error || !data) {
    return null;
  }

  const thread = data as unknown as MailThreadWithMessages;
  if (thread.messages && Array.isArray(thread.messages)) {
    thread.messages.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }

  return thread;
}
