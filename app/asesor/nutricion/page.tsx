import { PortalShell } from "@/components/portal-shell";
import { NurturingWorkspace } from "@/features/conversation/components/nurturing-workspace";

export default function NurturingPage() {
  return (
    <PortalShell role="asesor" title="Acompañamiento" subtitle="Supervisa rutas automáticas y atiende únicamente bloqueos o excepciones.">
      <NurturingWorkspace />
    </PortalShell>
  );
}
