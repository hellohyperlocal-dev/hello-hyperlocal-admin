export type EmailCategory = "security" | "invites" | "moderation" | "municipal" | "community";

export interface EmailVariableDefinition {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "number";
  defaultValue: string;
  description?: string;
}

export interface EmailTemplateDefinition {
  id: string;
  title: string;
  category: EmailCategory;
  description: string;
  defaultSubject: string;
  variables: EmailVariableDefinition[];
  renderHtml: (vars: Record<string, string>) => string;
  renderPlainText: (vars: Record<string, string>) => string;
}
