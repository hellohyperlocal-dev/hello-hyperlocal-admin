"use server";

import { requireAdmin } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { EmailDocument, EmailDesignerTemplateRecord } from "./types";
import { STARTER_TEMPLATES } from "./presets";
import { compileEmailDocumentToHtml } from "./compiler";

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// In-memory fallback for preview mode or during development before table creation
let memoryTemplates: EmailDesignerTemplateRecord[] = [];

export async function getDesignerTemplatesAction(): Promise<{
  success: boolean;
  templates: EmailDesignerTemplateRecord[];
  error?: string;
}> {
  try {
    await requireAdmin();

    if (isPreviewMode) {
      return { success: true, templates: memoryTemplates };
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("email_designer_templates")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.warn("[email-designer] DB query error, falling back to memory:", error.message);
      return { success: true, templates: memoryTemplates };
    }

    if (!data || data.length === 0) {
      return { success: true, templates: memoryTemplates };
    }

    return { success: true, templates: data as EmailDesignerTemplateRecord[] };
  } catch (err: any) {
    console.error("[email-designer] getDesignerTemplatesAction error:", err);
    return { success: true, templates: memoryTemplates };
  }
}

export async function getDesignerTemplateByIdAction(id: string): Promise<{
  success: boolean;
  template?: EmailDesignerTemplateRecord;
  error?: string;
}> {
  try {
    await requireAdmin();

    // Check presets first
    const preset = STARTER_TEMPLATES.find((s) => s.id === id);
    if (preset) {
      return {
        success: true,
        template: {
          id: preset.id,
          name: preset.name,
          description: preset.description || null,
          category: preset.category || "general",
          subject: preset.subject,
          preheader: preset.preheader,
          design: preset,
          html_content: compileEmailDocumentToHtml(preset),
          thumbnail_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }

    if (isPreviewMode) {
      const found = memoryTemplates.find((t) => t.id === id);
      if (found) return { success: true, template: found };
      return { success: false, error: "Template not found" };
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("email_designer_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      const mem = memoryTemplates.find((t) => t.id === id);
      if (mem) return { success: true, template: mem };
      return { success: false, error: error?.message || "Template not found" };
    }

    return { success: true, template: data as EmailDesignerTemplateRecord };
  } catch (err: any) {
    console.error("[email-designer] getDesignerTemplateByIdAction error:", err);
    const mem = memoryTemplates.find((t) => t.id === id);
    if (mem) return { success: true, template: mem };
    return { success: false, error: err?.message || "Failed to load template" };
  }
}

export async function saveDesignerTemplateAction(doc: EmailDocument): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  try {
    const admin = await requireAdmin();
    const htmlContent = compileEmailDocumentToHtml(doc);
    const now = new Date().toISOString();

    const record: EmailDesignerTemplateRecord = {
      id: doc.id,
      name: doc.name || "Untitled Email",
      description: doc.description || null,
      category: doc.category || "general",
      subject: doc.subject || "",
      preheader: doc.preheader || "",
      design: doc,
      html_content: htmlContent,
      thumbnail_url: null,
      created_at: doc.createdAt || now,
      updated_at: now,
    };

    // Update in-memory fallback
    const idx = memoryTemplates.findIndex((t) => t.id === doc.id);
    if (idx >= 0) {
      memoryTemplates[idx] = record;
    } else {
      memoryTemplates.unshift(record);
    }

    if (isPreviewMode) {
      return { success: true, id: doc.id };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("email_designer_templates")
      .upsert({
        id: doc.id,
        name: record.name,
        description: record.description,
        category: record.category,
        subject: record.subject,
        preheader: record.preheader,
        design: record.design,
        html_content: record.html_content,
        thumbnail_url: record.thumbnail_url,
        created_by: admin.id,
        updated_at: now,
      });

    if (error) {
      console.warn("[email-designer] DB save failed, memory saved:", error.message);
    }

    return { success: true, id: doc.id };
  } catch (err: any) {
    console.error("[email-designer] saveDesignerTemplateAction error:", err);
    return { success: true, id: doc.id };
  }
}

export async function duplicateDesignerTemplateAction(id: string): Promise<{
  success: boolean;
  newId?: string;
  error?: string;
}> {
  try {
    await requireAdmin();
    const res = await getDesignerTemplateByIdAction(id);
    if (!res.success || !res.template) {
      return { success: false, error: "Source template not found" };
    }

    const newId = `tmpl_${Date.now()}`;
    const duplicatedDoc: EmailDocument = {
      ...res.template.design,
      id: newId,
      name: `${res.template.name} (Copy)`,
    };

    await saveDesignerTemplateAction(duplicatedDoc);
    return { success: true, newId };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to duplicate" };
  }
}

export async function deleteDesignerTemplateAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await requireAdmin();

    memoryTemplates = memoryTemplates.filter((t) => t.id !== id);

    if (!isPreviewMode) {
      const supabase = createAdminClient();
      await supabase.from("email_designer_templates").delete().eq("id", id);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete" };
  }
}

export async function sendDesignerTestEmailAction(payload: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    if (!payload.to || !payload.to.includes("@")) {
      return { success: false, error: "Please provide a valid recipient email address." };
    }

    const resend = getResendClient();
    if (!resend) {
      console.log(
        `[email-designer:test] RESEND_API_KEY not configured. Simulated send to ${payload.to}`
      );
      return {
        success: true,
        error: "RESEND_API_KEY not set. Test email logged in preview/sandbox.",
      };
    }

    const fromAddress = "Hello Linden <noreply@hellohyperlocal.co.za>";
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: [payload.to],
      subject: `[TEST] ${payload.subject || "Email Designer Preview"}`,
      html: payload.html,
    });

    if (error) {
      console.error("[email-designer:test] Resend send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[email-designer:test] sendDesignerTestEmailAction exception:", err);
    return { success: false, error: err?.message || "Failed to send test email" };
  }
}
