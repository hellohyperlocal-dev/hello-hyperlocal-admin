import Link from "next/link";
import { Card } from "@/components/ui/card";

interface Props {
  label: string;
  value: number;
  href?: string;
}

export function StatCard({ label, value, href }: Props) {
  const content = (
    <Card className="px-6 transition-shadow hover:shadow-md">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-foreground">{value.toLocaleString()}</p>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
