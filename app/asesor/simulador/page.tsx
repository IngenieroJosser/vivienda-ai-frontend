import { PortalShell } from "@/components/portal-shell";
import { SimulationWorkspace } from "@/features/advisor/components/simulation-workspace";

export default function SimulationPage() {
  return (
    <PortalShell
      role="asesor"
      title="Simulaciones de preparación"
      subtitle="Explica qué condición puede acercar un lead al cierre sin modificar su evaluación real ni prometer aprobación."
    >
      <SimulationWorkspace />
    </PortalShell>
  );
}
