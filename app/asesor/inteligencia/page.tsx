import { PortalShell } from "@/components/portal-shell";
import { IntelligenceCenter } from "@/features/advisor/components/intelligence-center";

export default function IntelligencePage() {
  return (
    <PortalShell
      role="asesor"
      title="Inteligencia de perfilamiento"
      subtitle="Origen, calidad, latencia, modelo y enriquecimiento opcional para acelerar la conversación sin reemplazar al asesor."
    >
      <IntelligenceCenter />
    </PortalShell>
  );
}
