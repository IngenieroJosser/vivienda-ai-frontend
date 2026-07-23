import { PortalShell } from "@/components/portal-shell";
import { ProjectComparator } from "@/features/advisor/components/project-comparator";

export default async function ComparadorPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>;
}) {
  const { leadId } = await searchParams;
  return (
    <PortalShell
      role="asesor"
      title="Comparador de proyectos"
      subtitle="Contrasta hasta tres opciones usando la misma recomendación explicable del prospecto."
    >
      <ProjectComparator initialLeadId={leadId} />
    </PortalShell>
  );
}
