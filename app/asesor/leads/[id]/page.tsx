import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { Icon } from "@/components/icon";
import { LeadDetailClient } from "@/features/advisor/components/lead-detail-client";
import { getScenarioByLeadId, scenarios } from "@/features/conversation/scenarios";
import type { Scenario } from "@/features/conversation/domain";

export const dynamicParams = true;

export function generateStaticParams() {
  return Object.values(scenarios).map((scenario) => ({ id: scenario.leadId }));
}

function buildSubtitle(scenario: Readonly<Scenario> | undefined): string {
  if (!scenario) {
    return "Detalle persistido desde el servicio. El nombre y el origen aparecen al cargar la información.";
  }
  const origin = scenario.leadSource === "ORGANIC" ? "canal orgánico" : "campaña de Meta";
  return `Preparación comercial · Origen: ${origin}`;
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scenario = getScenarioByLeadId(id);
  const title = scenario?.displayName ?? "Oportunidad en cartera";
  const subtitle = buildSubtitle(scenario);

  return (
    <PortalShell role="asesor" title={title} subtitle={subtitle}>
      <Link href="/asesor/leads" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--vm-color-ink-muted)] hover:text-[color:var(--vm-color-brand-blue)]"><Icon name="arrow" className="h-4 w-4 rotate-180" />Volver a la bandeja</Link>
      <LeadDetailClient leadId={id} />
    </PortalShell>
  );
}
