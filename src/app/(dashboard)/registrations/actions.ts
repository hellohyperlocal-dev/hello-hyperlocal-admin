"use server";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPreviewMode } from "@/lib/preview-mode";
import { renderBaseEmailLayout } from "@/lib/email-templates/base-layout";
import { Resend } from "resend";

const FROM_ADDRESS = "Hello Linden <noreply@hellohyperlocal.co.za>";
const REPLY_TO_ADDRESS = "info@hellohyperlocal.co.za";

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMessageToHtml(text: string): string {
  // Convert line breaks and multiple paragraphs into clean email HTML
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return "";

  return paragraphs
    .map((p) => {
      // Support basic bullet points if lines start with • or - or *
      const lines = p.split("\n");
      const isBulletList = lines.every((l) => /^[•\-*]\s+/.test(l.trim()));

      if (isBulletList) {
        const items = lines
          .map((l) => `<li style="margin-bottom: 6px;">${escapeHtml(l.replace(/^[•\-*]\s+/, ""))}</li>`)
          .join("");
        return `<ul style="margin: 0 0 16px 0; padding-left: 20px; color: #334155;">${items}</ul>`;
      }

      const formattedLines = lines.map((l) => escapeHtml(l)).join("<br/>");
      return `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #334155;">${formattedLines}</p>`;
    })
    .join("");
}

export interface SendRegistrantEmailParams {
  to: string;
  recipientName: string;
  subject: string;
  message: string;
  badgeLabel?: string;
}

export async function sendRegistrantEmail({
  to,
  recipientName,
  subject,
  message,
  badgeLabel = "Community Update",
}: SendRegistrantEmailParams): Promise<{ success: boolean; error?: string; simulated?: boolean }> {
  await requireAdmin();

  if (!to || !to.includes("@")) {
    return { success: false, error: "A valid recipient email address is required." };
  }
  if (!subject.trim()) {
    return { success: false, error: "Please enter a subject line." };
  }
  if (!message.trim()) {
    return { success: false, error: "Please enter email message content." };
  }

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1c472a;">${escapeHtml(subject)}</h1>
    ${formatMessageToHtml(message)}
  `;

  const html = renderBaseEmailLayout({
    title: subject,
    previewText: subject,
    badge: { text: badgeLabel, variant: "success" },
    contentHtml,
  });

  const resend = getResendClient();

  if (isPreviewMode || !resend) {
    console.log(
      `[email:registrant] ${isPreviewMode ? "Preview Mode" : "No RESEND_API_KEY"} - simulated email to ${recipientName} <${to}>:`,
      { subject, length: message.length }
    );
    return { success: true, simulated: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      replyTo: REPLY_TO_ADDRESS,
      to,
      subject,
      html,
      text: message,
    });

    if (error) {
      console.error(`[email:registrant] Failed to send email to ${to}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to send email.";
    console.error(`[email:registrant] Error:`, err);
    return { success: false, error: msg };
  }
}

export interface SendBroadcastEmailParams {
  audience: "all" | "founding_business" | "founding_neighbour" | "partner_interest";
  subject: string;
  message: string;
}

export async function sendBroadcastEmail({
  audience,
  subject,
  message,
}: SendBroadcastEmailParams): Promise<{ success: boolean; count: number; error?: string; simulated?: boolean }> {
  await requireAdmin();

  if (!subject.trim()) {
    return { success: false, count: 0, error: "Please provide a subject line." };
  }
  if (!message.trim()) {
    return { success: false, count: 0, error: "Please provide a message body." };
  }

  // 1. Fetch recipient list
  if (isPreviewMode) {
    return { success: true, count: 2, simulated: true };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("registrations")
    .select("id, email, roles, full_name, first_name, last_name, business_name");

  if (error || !data) {
    return { success: false, count: 0, error: error?.message || "Failed to load registrations." };
  }

  // Filter according to audience
  const filtered = data.filter((row) => {
    if (!row.email || !row.email.includes("@")) return false;
    const roles: string[] = Array.isArray(row.roles) ? row.roles : [];
    if (audience === "all") return true;
    if (audience === "founding_business") {
      return roles.includes("founding_business") || roles.includes("business");
    }
    if (audience === "founding_neighbour") {
      return roles.includes("founding_neighbour") || roles.includes("resident");
    }
    if (audience === "partner_interest") {
      return roles.includes("partner_interest");
    }
    return false;
  });

  // Deduplicate emails
  const emailMap = new Map<string, string>(); // email -> recipient name
  for (const r of filtered) {
    const normalizedEmail = r.email.toLowerCase().trim();
    if (!emailMap.has(normalizedEmail)) {
      const name = r.full_name || [r.first_name, r.last_name].filter(Boolean).join(" ") || r.business_name || "Neighbor";
      emailMap.set(normalizedEmail, name);
    }
  }

  const recipients = Array.from(emailMap.entries()).map(([email, name]) => ({ email, name }));

  if (recipients.length === 0) {
    return { success: false, count: 0, error: "No recipients found for the selected audience." };
  }

  const resend = getResendClient();
  if (!resend) {
    console.log(`[email:broadcast] No RESEND_API_KEY - simulated broadcast to ${recipients.length} recipients:`, {
      audience,
      subject,
    });
    return { success: true, count: recipients.length, simulated: true };
  }

  const audienceLabel =
    audience === "founding_business"
      ? "Founding Business"
      : audience === "founding_neighbour"
      ? "Founding Neighbour"
      : "Community Update";

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1c472a;">${escapeHtml(subject)}</h1>
    ${formatMessageToHtml(message)}
  `;

  const html = renderBaseEmailLayout({
    title: subject,
    previewText: subject,
    badge: { text: audienceLabel, variant: "success" },
    contentHtml,
  });

  // Send batch emails in chunks of 50
  let successCount = 0;
  const CHUNK_SIZE = 50;

  for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
    const chunk = recipients.slice(i, i + CHUNK_SIZE);
    try {
      const emailBatch = chunk.map((r) => ({
        from: FROM_ADDRESS,
        replyTo: REPLY_TO_ADDRESS,
        to: r.email,
        subject,
        html,
        text: message,
      }));

      const res = await resend.batch.send(emailBatch);
      if (res.data) {
        successCount += chunk.length;
      } else if (res.error) {
        console.error(`[email:broadcast] Batch chunk error:`, res.error);
      }
    } catch (err) {
      console.error(`[email:broadcast] Failed chunk send:`, err);
    }
  }

  return { success: true, count: successCount || recipients.length };
}

export async function getAudienceCounts(): Promise<{
  all: number;
  founding_business: number;
  founding_neighbour: number;
  partner_interest: number;
}> {
  await requireAdmin();

  if (isPreviewMode) {
    return {
      all: 2,
      founding_business: 1,
      founding_neighbour: 1,
      partner_interest: 0,
    };
  }

  const admin = createAdminClient();
  const { data } = await admin.from("registrations").select("roles, email");

  if (!data) {
    return { all: 0, founding_business: 0, founding_neighbour: 0, partner_interest: 0 };
  }

  const valid = data.filter((r) => r.email && r.email.includes("@"));
  let founding_business = 0;
  let founding_neighbour = 0;
  let partner_interest = 0;

  for (const row of valid) {
    const roles: string[] = Array.isArray(row.roles) ? row.roles : [];
    if (roles.includes("founding_business") || roles.includes("business")) {
      founding_business++;
    }
    if (roles.includes("founding_neighbour") || roles.includes("resident")) {
      founding_neighbour++;
    }
    if (roles.includes("partner_interest")) {
      partner_interest++;
    }
  }

  return {
    all: valid.length,
    founding_business,
    founding_neighbour,
    partner_interest,
  };
}
