import { PortalShell } from "@/components/portal-shell";
import { CommercialDashboard } from "@/features/advisor/components/commercial-dashboard";

export default function LeadsPage() {
  return (
    <PortalShell role="asesor" title="Bandeja comercial" subtitle="Solo oportunidades calificadas y listas para atención humana. Los prospectos en preparación permanecen en Acompañamiento.">
      <CommercialDashboard fullInbox />
    </PortalShell>
  );
}
