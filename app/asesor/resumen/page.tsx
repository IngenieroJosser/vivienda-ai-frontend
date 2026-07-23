import { PortalShell } from "@/components/portal-shell";
import { AdvisorSummaryClient } from "@/features/conversation/components/advisor-summary-client";

export default function AdvisorSummaryPage() {
  return (
    <PortalShell role="asesor" title="Resumen de oportunidades" subtitle="Qué requiere atención, por qué está priorizado y cuál es la próxima mejor acción.">
      <AdvisorSummaryClient />
    </PortalShell>
  );
}
