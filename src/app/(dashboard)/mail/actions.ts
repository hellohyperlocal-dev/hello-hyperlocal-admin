"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";
import { Resend } from "resend";
import type { MailMessageRow } from "@/lib/mail";

const DEFAULT_FROM_ADDRESS = "Hello Linden <noreply@hellohyperlocal.co.za>";

export interface SendReplyInput {
  threadId: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  toName: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string | null;
  templateId?: string | null;
}

export interface ComposeEmailInput {
  fromEmail: string;
  fromName: string;
  toEmail: string;
  toName: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string | null;
  templateId?: string | null;
  category?: string;
}

export interface ThreadStateUpdates {
  is_starred?: boolean;
  is_archived?: boolean;
  is_trashed?: boolean;
  status?: "unread" | "read" | "replied" | "closed";
  snoozed_until?: string | null;
}

export interface RecipientSuggestion {
  email: string;
  name: string;
  category: string;
  suburb?: string | null;
}

/**
 * Sends a reply to an existing mail thread via Resend, inserts an outbound mail_messages record,
 * and updates thread status to 'replied'.
 */
export async function sendReplyAction(
  input: SendReplyInput
): Promise<{ success?: boolean; error?: string; message?: MailMessageRow }> {
  const admin = await requireAdmin();

  if (!input.toEmail || !input.toEmail.includes("@")) {
    return { error: "A valid recipient email address is required." };
  }
  if (!input.bodyText || input.bodyText.trim().length === 0) {
    return { error: "Please enter a message before sending." };
  }

  const supabase = createAdminClient();

  // 1. Send via Resend (unless in preview mode)
  if (!isPreviewMode) {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        // Build sender address. Resend requires sending from verified domain (hellohyperlocal.co.za).
        // If fromEmail is on a different domain, use DEFAULT_FROM_ADDRESS with reply_to.
        const isVerifiedDomain = input.fromEmail.endsWith("@hellohyperlocal.co.za");
        const fromAddress = isVerifiedDomain
          ? `${input.fromName} <${input.fromEmail}>`
          : DEFAULT_FROM_ADDRESS;

        const { error: resendError } = await resend.emails.send({
          from: fromAddress,
          to: input.toEmail,
          replyTo: input.fromEmail,
          subject: input.subject,
          text: input.bodyText,
          html: input.bodyHtml || undefined,
        });

        if (resendError) {
          console.error("Resend send error:", resendError);
          return { error: `Email dispatch failed: ${resendError.message}` };
        }
      } catch (err: unknown) {
        console.error("Resend exception:", err);
        return {
          error:
            err instanceof Error
              ? err.message
              : "Failed to dispatch email via provider.",
        };
      }
    }
  }

  // 2. Insert outbound message row into mail_messages
  const { data: insertedMessage, error: insertError } = await supabase
    .from("mail_messages")
    .insert({
      thread_id: input.threadId,
      direction: "outbound",
      from_email: input.fromEmail.toLowerCase(),
      from_name: input.fromName,
      to_email: input.toEmail.toLowerCase(),
      to_name: input.toName,
      subject: input.subject,
      body_text: input.bodyText,
      body_html: input.bodyHtml || null,
      template_id: input.templateId || null,
      sent_by_admin_id: admin.id !== "preview-admin" ? admin.id : null,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error inserting outbound mail_message:", insertError);
    return { error: "Failed to save sent message to conversation history." };
  }

  // 3. Update parent mail_thread status & timestamp
  const { data: threadData } = await supabase
    .from("mail_threads")
    .update({
      status: "replied",
      last_message_at: new Date().toISOString(),
      is_archived: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.threadId)
    .select("registration_id")
    .single();

  // 4. If linked to a registration, mark registration as claimed if not already
  if (threadData?.registration_id) {
    await supabase
      .from("registrations")
      .update({
        claimed_at: new Date().toISOString(),
      })
      .eq("id", threadData.registration_id)
      .is("claimed_at", null);
  }

  // 5. Append audit activity log
  await logActivity(admin.id, "mail.reply_sent", "mail_thread", input.threadId, {
    to: input.toEmail,
    subject: input.subject,
    templateId: input.templateId || null,
  });

  revalidatePath("/mail");
  return { success: true, message: insertedMessage as MailMessageRow };
}

/**
 * Composes and sends a new mail thread from scratch.
 */
export async function composeEmailAction(
  input: ComposeEmailInput
): Promise<{ success?: boolean; error?: string; threadId?: string }> {
  const admin = await requireAdmin();

  if (!input.toEmail || !input.toEmail.includes("@")) {
    return { error: "A valid recipient email address is required." };
  }
  if (!input.subject || input.subject.trim().length === 0) {
    return { error: "Please enter an email subject." };
  }
  if (!input.bodyText || input.bodyText.trim().length === 0) {
    return { error: "Please enter email content before sending." };
  }

  const supabase = createAdminClient();

  // 1. Send via Resend
  if (!isPreviewMode) {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        const isVerifiedDomain = input.fromEmail.endsWith("@hellohyperlocal.co.za");
        const fromAddress = isVerifiedDomain
          ? `${input.fromName} <${input.fromEmail}>`
          : DEFAULT_FROM_ADDRESS;

        const { error: resendError } = await resend.emails.send({
          from: fromAddress,
          to: input.toEmail,
          replyTo: input.fromEmail,
          subject: input.subject,
          text: input.bodyText,
          html: input.bodyHtml || undefined,
        });

        if (resendError) {
          console.error("Resend compose error:", resendError);
          return { error: `Email dispatch failed: ${resendError.message}` };
        }
      } catch (err: unknown) {
        console.error("Resend exception:", err);
        return {
          error:
            err instanceof Error
              ? err.message
              : "Failed to dispatch email via provider.",
        };
      }
    }
  }

  // 2. Create new mail_thread row
  const { data: newThread, error: threadError } = await supabase
    .from("mail_threads")
    .insert({
      subject: input.subject,
      sender_name: input.toName || input.toEmail,
      sender_email: input.toEmail.toLowerCase(),
      category: input.category || "general_enquiry",
      status: "replied",
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (threadError || !newThread) {
    console.error("Error creating mail_thread:", threadError);
    return { error: "Failed to create conversation thread in database." };
  }

  // 3. Insert outbound message row into mail_messages
  const { error: messageError } = await supabase.from("mail_messages").insert({
    thread_id: newThread.id,
    direction: "outbound",
    from_email: input.fromEmail.toLowerCase(),
    from_name: input.fromName,
    to_email: input.toEmail.toLowerCase(),
    to_name: input.toName || input.toEmail,
    subject: input.subject,
    body_text: input.bodyText,
    body_html: input.bodyHtml || null,
    template_id: input.templateId || null,
    sent_by_admin_id: admin.id !== "preview-admin" ? admin.id : null,
  });

  if (messageError) {
    console.error("Error inserting mail_message for new thread:", messageError);
  }

  // 4. Log activity
  await logActivity(admin.id, "mail.compose_sent", "mail_thread", newThread.id, {
    to: input.toEmail,
    subject: input.subject,
    templateId: input.templateId || null,
  });

  revalidatePath("/mail");
  return { success: true, threadId: newThread.id };
}

/**
 * Updates thread state flags (star, archive, trash, read status, snooze).
 */
export async function updateThreadStateAction(
  threadId: string,
  updates: ThreadStateUpdates
): Promise<{ success?: boolean; error?: string }> {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("mail_threads")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", threadId);

  if (error) {
    console.error("Error updating mail thread state:", error);
    return { error: "Failed to update thread state." };
  }

  await logActivity(admin.id, "mail.thread_updated", "mail_thread", threadId, { ...updates });
  revalidatePath("/mail");
  return { success: true };
}

/**
 * Batch updates multiple threads (e.g. mark all read, bulk archive, bulk trash).
 */
export async function batchUpdateThreadsAction(
  threadIds: string[],
  updates: ThreadStateUpdates
): Promise<{ success?: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (!threadIds || threadIds.length === 0) return { success: true };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("mail_threads")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .in("id", threadIds);

  if (error) {
    console.error("Error batch updating mail threads:", error);
    return { error: "Failed to update selected threads." };
  }

  await logActivity(admin.id, "mail.batch_updated", "mail_thread", "bulk", {
    count: threadIds.length,
    ...updates,
  });

  revalidatePath("/mail");
  return { success: true };
}

/**
 * Auto-suggest search for recipient picker in Compose dialog.
 * Searches across existing registrations and directory profiles.
 */
export async function searchRecipientsAction(
  query: string
): Promise<RecipientSuggestion[]> {
  await requireAdmin();
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];

  const supabase = createAdminClient();

  // Search registrations
  const { data: regRows } = await supabase
    .from("registrations")
    .select("email, first_name, last_name, full_name, business_name, suburb, roles")
    .or(
      `email.ilike.%${trimmed}%,full_name.ilike.%${trimmed}%,first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%,business_name.ilike.%${trimmed}%`
    )
    .limit(10);

  const suggestions: RecipientSuggestion[] = [];
  const seenEmails = new Set<string>();

  (regRows || []).forEach((r) => {
    const email = r.email.toLowerCase();
    if (!seenEmails.has(email)) {
      seenEmails.add(email);
      const name =
        r.full_name ||
        [r.first_name, r.last_name].filter(Boolean).join(" ") ||
        r.business_name ||
        email;
      const role = r.roles?.[0] || "Registration";
      suggestions.push({
        email,
        name,
        category: role,
        suburb: r.suburb,
      });
    }
  });

  return suggestions;
}
