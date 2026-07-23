import { PortalShell } from "@/components/portal-shell";
import { AgendaWorkspace } from "@/features/advisor/components/agenda-workspace";

export default function AgendaPage() {
  return (
    <PortalShell role="asesor" title="Agenda comercial" subtitle="Seguimientos y primeros contactos derivados de la gestión local de oportunidades.">
      <AgendaWorkspace />
    </PortalShell>
  );
}
