import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { Icon } from "@/components/icon";
import { BackendLeadDetailView } from "@/features/backend/components/backend-lead-detail";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PortalShell role="asesor" title="Expediente comercial" subtitle="Datos, evaluación, conversación y recomendaciones persistidos en FastAPI."><Link href="/asesor/leads" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--vm-color-ink-muted)] hover:text-[color:var(--vm-color-brand-blue)]"><Icon name="arrow" className="h-4 w-4 rotate-180" />Volver a la bandeja</Link><BackendLeadDetailView leadId={id} /></PortalShell>;
}
