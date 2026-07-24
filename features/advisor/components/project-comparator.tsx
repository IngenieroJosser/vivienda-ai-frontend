"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { useQualifiedLeads } from "@/features/conversation/components/use-qualified-leads";
import {
  formatProjectAreaRange,
  formatProjectPrice,
  getHousingProject,
  getValidityLabel,
  housingProjects,
  type HousingProject,
} from "@/lib/housing-catalog";

const MAX_PROJECTS = 3;

export function ProjectComparator({
  initialLeadId,
}: {
  initialLeadId?: string;
}) {
  const leads = useQualifiedLeads();
  const comparableLeads = useMemo(
    () => leads.filter(({ evaluation }) => evaluation.projectMatches.length),
    [leads],
  );
  const [leadId, setLeadId] = useState(initialLeadId ?? "");
  const activeLead =
    comparableLeads.find(({ scenario }) => scenario.leadId === leadId) ??
    comparableLeads[0];
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [candidateId, setCandidateId] = useState("");
  const activeLeadId = activeLead?.scenario.leadId ?? "";
  const selectedIds =
    selections[activeLeadId] ??
    activeLead?.evaluation.projectMatches
      .slice(0, MAX_PROJECTS)
      .map(({ projectId }) => projectId) ??
    [];

  const selectedProjects = selectedIds.flatMap((id) => {
    const project = getHousingProject(id);
    return project ? [project] : [];
  });
  const matchMap = new Map(
    activeLead?.evaluation.projectMatches.map((match) => [
      match.projectId,
      match,
    ]) ?? [],
  );
  const availableProjects = housingProjects.filter(
    ({ id }) => !selectedIds.includes(id),
  );

  function addProject() {
    if (!candidateId || selectedIds.length >= MAX_PROJECTS) return;
    setSelections((current) => ({
      ...current,
      [activeLeadId]: [...selectedIds, candidateId],
    }));
    setCandidateId("");
  }

  function removeProject(projectId: string) {
    setSelections((current) => ({
      ...current,
      [activeLeadId]: selectedIds.filter((id) => id !== projectId),
    }));
  }

  return (
    <div className="space-y-5">
      <section className="surface-solid p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <label>
            <span className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">Oportunidad seleccionada</span>
            <select value={activeLead?.scenario.leadId ?? ""} onChange={(event) => setLeadId(event.target.value)} className="mt-2 h-12 w-full rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-white px-4 text-sm font-semibold">
              {comparableLeads.map(({ scenario }) => <option key={scenario.leadId} value={scenario.leadId}>{scenario.displayName}</option>)}
            </select>
          </label>
          <label>
            <span className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">Añadir otro proyecto</span>
            <select value={candidateId} onChange={(event) => setCandidateId(event.target.value)} disabled={selectedIds.length >= MAX_PROJECTS} className="mt-2 h-12 w-full rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-white px-4 text-sm disabled:opacity-50">
              <option value="">Selecciona una opción</option>
              {availableProjects.map((project) => <option key={project.id} value={project.id}>{project.name} · {project.location.city}</option>)}
            </select>
          </label>
          <button type="button" onClick={addProject} disabled={!candidateId || selectedIds.length >= MAX_PROJECTS} className="min-h-12 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white disabled:opacity-40">Añadir</button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {selectedProjects.map((project) => (
            <span key={project.id} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[color:var(--vm-color-brand-blue)]/15 bg-[color:var(--vm-color-brand-blue)]/[.05] px-3 text-xs font-semibold">
              {project.name}
              <button type="button" onClick={() => removeProject(project.id)} aria-label={`Quitar ${project.name}`} className="grid h-7 w-7 place-items-center rounded-full bg-white"><Icon name="close" className="h-3 w-3" /></button>
            </span>
          ))}
          <span className="text-xs text-[color:var(--vm-color-ink-muted)]">{selectedIds.length}/{MAX_PROJECTS} seleccionados</span>
        </div>
      </section>

      {selectedProjects.length ? (
        <section className="surface-solid overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 w-44 border-b border-r border-[color:var(--vm-color-line)] bg-white p-4 text-left text-xs uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">Criterio</th>
                  {selectedProjects.map((project) => (
                    <th key={project.id} className="min-w-60 border-b border-[color:var(--vm-color-line)] p-4 text-left align-top">
                      <div className="relative h-28 overflow-hidden rounded-[var(--vm-radius-control)]">
                        <Image src={project.image} alt={project.name} fill sizes="280px" className="object-cover" />
                      </div>
                      <div className="mt-3 text-xs text-[color:var(--vm-color-brand-blue)]">{project.location.city}</div>
                      <h2 className="mt-1 text-lg font-semibold">{project.name}</h2>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <ComparisonRow label="Ubicación" projects={selectedProjects} render={(project) => `${project.location.development} · ${project.location.city}`} />
                <ComparisonRow label="Precio vigente" projects={selectedProjects} render={(project) => project.priceFromCop.validity === "CURRENT" ? formatProjectPrice(project) : "Por confirmar"} />
                <ComparisonRow label="Área construida" projects={selectedProjects} render={formatProjectAreaRange} />
                <ComparisonRow label="Habitaciones" projects={selectedProjects} render={(project) => project.bedrooms.value ?? "Por confirmar"} />
                <ComparisonRow label="Acabado" projects={selectedProjects} render={(project) => project.finish.value ?? "Por confirmar"} />
                <ComparisonRow label="Certificación" projects={selectedProjects} render={(project) => project.certification.value ?? "No indicada"} />
                <ComparisonRow label="Entrega" projects={selectedProjects} render={(project) => getValidityLabel(project.deliveryDate.validity)} />
                <ComparisonRow label="Folleto y recorrido virtual" projects={selectedProjects} render={(project) => <ProjectLinks project={project} />} />
                <ComparisonRow label="Razón de coincidencia" projects={selectedProjects} render={(project) => {
                  const reasons = matchMap.get(project.id)?.reasons;
                  return reasons?.length ? <ul className="space-y-1.5">{reasons.map((reason) => <li key={reason} className="flex gap-2"><Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--vm-color-success)]" />{reason}</li>)}</ul> : "Añadido manualmente para comparación";
                }} />
              </tbody>
            </table>
          </div>
          <div className="border-t border-[color:var(--vm-color-line)] p-4 text-xs text-[color:var(--vm-color-ink-muted)]">Los datos sin vigencia confirmada se muestran como “Por confirmar”. Añadir un proyecto no modifica la recomendación calculada para la oportunidad.</div>
        </section>
      ) : (
        <section className="surface-solid p-10 text-center"><Icon name="compare" className="mx-auto h-8 w-8 text-[color:var(--vm-color-brand-blue)]" /><h2 className="mt-4 text-lg font-semibold">Selecciona hasta tres proyectos</h2><p className="mt-2 text-sm text-[color:var(--vm-color-ink-muted)]">La comparación comenzará con las recomendaciones de la oportunidad elegida.</p></section>
      )}
    </div>
  );
}

function ComparisonRow({ label, projects, render }: { label: string; projects: HousingProject[]; render: (project: HousingProject) => React.ReactNode }) {
  return <tr><th scope="row" className="sticky left-0 z-10 border-b border-r border-[color:var(--vm-color-line)] bg-white p-4 text-left text-xs font-semibold">{label}</th>{projects.map((project) => <td key={project.id} className="border-b border-[color:var(--vm-color-line)] p-4 align-top text-xs leading-5">{render(project)}</td>)}</tr>;
}

function ProjectLinks({ project }: { project: HousingProject }) {
  const tour = project.tours.find(({ availability }) => availability === "AVAILABLE");
  return <div className="space-y-2">{project.brochureUrl ? <a href={project.brochureUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-semibold text-[color:var(--vm-color-brand-blue)]">Ver folleto <Icon name="arrow" className="h-3 w-3" /></a> : <span>Sin folleto disponible</span>}{tour ? <a href={tour.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-semibold text-[color:var(--vm-color-brand-blue)]">Abrir recorrido virtual <Icon name="arrow" className="h-3 w-3" /></a> : <span className="block text-[color:var(--vm-color-ink-muted)]">Sin recorrido disponible</span>}<Link href={`/vivienda/proyectos/${project.id}`} className="flex items-center gap-2 font-semibold text-[color:var(--vm-color-brand-blue)]">Ver ficha <Icon name="arrow" className="h-3 w-3" /></Link></div>;
}
