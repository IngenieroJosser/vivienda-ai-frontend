import { PortalShell } from "@/components/portal-shell";
import { BackendLeadInbox } from "@/features/backend/components/backend-lead-inbox";

export default function LeadsPage() {
  return <PortalShell role="asesor" title="Bandeja comercial" subtitle="Oportunidades reales persistidas, evaluadas y priorizadas por el backend."><BackendLeadInbox /></PortalShell>;
}
