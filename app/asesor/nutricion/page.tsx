import { PortalShell } from "@/components/portal-shell";
import { NurturingWorkspace } from "@/features/conversation/components/nurturing-workspace";

export default function NurturingPage() {
  return (
    <PortalShell role="asesor" title="Nutrición de leads" subtitle="Acompañamiento accionable para prospectos que todavía no deben pasar a cierre.">
      <NurturingWorkspace />
    </PortalShell>
  );
}
