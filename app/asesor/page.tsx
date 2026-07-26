import { PortalShell } from "@/components/portal-shell";
import { AdvisorOverviewDashboard } from "@/features/advisor/components/advisor-overview-dashboard";

export default async function AdvisorPage({
  searchParams,
}: {
  readonly searchParams: Promise<{
    leadId?: string | string[];
    from?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const leadId = firstValue(params.leadId);
  const source = firstValue(params.from);
  return (
    <PortalShell
      role="asesor"
      title="Panorama comercial y acompañamiento"
      subtitle="Prioriza cierres, acompaña a quienes aún no están listos y consulta la evidencia que sustenta cada recomendación."
    >
      <AdvisorOverviewDashboard
        focusLeadId={safeLeadId(leadId)}
        receivedFromChat={source === "chat"}
      />
    </PortalShell>
  );
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function safeLeadId(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return /^[a-zA-Z0-9-]{1,128}$/.test(trimmed) ? trimmed : undefined;
}
