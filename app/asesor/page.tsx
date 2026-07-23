import { PortalShell } from "@/components/portal-shell";
import { CommercialDashboard } from "@/features/advisor/components/commercial-dashboard";

export default function AdvisorPage() {
  return (
    <PortalShell
      role="asesor"
      title="Oportunidades que requieren atención"
      subtitle="A quién contactar primero, por qué está preparado y qué acción puede acercarlo al cierre."
    >
      <CommercialDashboard />
    </PortalShell>
  );
}
