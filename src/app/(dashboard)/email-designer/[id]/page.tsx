import { notFound } from "next/navigation";
import { getDesignerTemplateByIdAction } from "@/lib/email-designer/actions";
import { DesignerClient } from "../components/designer-client";
import { STARTER_TEMPLATES } from "@/lib/email-designer/presets";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EmailDesignerEditorPage({ params }: Props) {
  const { id } = await params;
  const res = await getDesignerTemplateByIdAction(id);

  if (!res.success || !res.template) {
    // If not found in DB, check starters
    const starter = STARTER_TEMPLATES.find((s) => s.id === id);
    if (starter) {
      return <DesignerClient initialDocument={JSON.parse(JSON.stringify(starter))} />;
    }
    notFound();
  }

  return <DesignerClient initialDocument={JSON.parse(JSON.stringify(res.template.design))} />;
}
