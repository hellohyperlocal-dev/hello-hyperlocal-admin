"use server";

import { requireAdmin } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { EMAIL_TEMPLATES } from "@/lib/email-templates/templates";
import { Resend } from "resend";

const FROM_ADDRESS = "Hello Linden <noreply@hellohyperlocal.co.za>";

export async function sendTestEmailAction({
  templateId,
  toEmail,
  variables,
}: {
  templateId: string;
  toEmail: string;
  variables: Record<string, string>;
}): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin();

  if (!toEmail || !toEmail.includes("@")) {
    return { error: "Please enter a valid recipient email address." };
  }

  const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    return { error: "Template not found." };
  }

  const html = template.renderHtml(variables);
  const text = template.renderPlainText(variables);
  const subject = `[TEST] ${template.defaultSubject}`;

  if (isPreviewMode) {
    return { success: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      error: "RESEND_API_KEY is not configured in your environment variables. Test email could not be sent.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: toEmail,
      subject,
      html,
      text,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to dispatch test email.";
    return { error: message };
  }
}
