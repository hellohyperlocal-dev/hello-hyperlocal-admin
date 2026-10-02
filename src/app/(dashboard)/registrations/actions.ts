"use server";

import { requireAdmin } from "@/lib/auth";
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

/**
 * Sends a personal branded email directly to an individual registrant from the admin panel.
 */
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
