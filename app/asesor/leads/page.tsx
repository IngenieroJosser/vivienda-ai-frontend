import { PortalShell } from "@/components/portal-shell";
import { CommercialDashboard } from "@/features/advisor/components/commercial-dashboard";

export default function LeadsPage() {
  return (
    <PortalShell role="asesor" title="Bandeja comercial" subtitle="Oportunidades preparadas para atención humana. Los prospectos que aún tienen una condición pendiente permanecen en Acompañamiento.">
      <CommercialDashboard fullInbox />
    </PortalShell>
  );
}
