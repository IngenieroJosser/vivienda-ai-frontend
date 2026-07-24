import { PortalShell } from "@/components/portal-shell";
import { CommercialDashboard } from "@/features/advisor/components/commercial-dashboard";

export default function LeadsPage() {
  return (
    <PortalShell role="asesor" title="Bandeja comercial" subtitle="Leads sincronizados desde el backend, ordenados por prioridad y ruta de acompañamiento.">
      <CommercialDashboard fullInbox />
    </PortalShell>
  );
}
