"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { formatCop } from "../profile-copy";
import { isCommercialOpportunity, isNurturingLead } from "../qualified-leads";
import {
  getEvidencePresentation,
  getReadinessPresentation,
} from "../readiness-presentation";
import { useQualifiedLeads } from "./use-qualified-leads";

export function AdvisorSummaryClient() {
  const qualifiedLeads = useQualifiedLeads();
  const opportunities = qualifiedLeads
    .filter(({ evaluation }) => isCommercialOpportunity(evaluation))
    .sort((a, b) => b.evaluation.readinessScore - a.evaluation.readinessScore);
  const nurturing = qualifiedLeads.filter(({ evaluation }) => isNurturingLead(evaluation));
  const paidReady = opportunities.filter(({ scenario }) => scenario.leadSource === "META").length;
  const solidEvidence = opportunities.filter(
    ({ evaluation }) =>
      getEvidencePresentation(evaluation.confidenceScore).label === "Sólida",
  ).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores de calificación">
        <SummaryMetric icon="target" label="Listos para asesor" value={String(opportunities.length)} detail="Requieren atención comercial" accent />
        <SummaryMetric icon="heart" label="En acompañamiento" value={String(nurturing.length)} detail="Con condición de avance" />
        <SummaryMetric icon="campaign" label="Pagos listos" value={String(paidReady)} detail="Leads de Meta priorizados" />
        <SummaryMetric icon="document" label="Evidencia sólida" value={String(solidEvidence)} detail="Con información suficiente" />
      </section>

      <section className="surface-solid overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-[color:var(--vm-color-line)] p-6 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Atención inmediata</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">Oportunidades listas para conversar</h2>
            <p className="mt-2 text-sm text-[color:var(--vm-color-ink-muted)]">Ordenadas por preparación comercial, con el motivo y la acción visibles.</p>
          </div>
          <Link href="/asesor/leads" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[color:var(--vm-color-brand-blue)]">Ver bandeja completa <Icon name="arrow" className="h-4 w-4" /></Link>
        </div>

        <div className="divide-y divide-[color:var(--vm-color-line)]">
          {opportunities.map(({ scenario, evaluation }, index) => (
            <article key={scenario.leadId} className="grid gap-5 p-6 lg:grid-cols-[auto_1.2fr_.85fr_auto] lg:items-center">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] text-sm font-bold text-white">{scenario.displayName.slice(0, 2).toUpperCase()}</span>
                <div>
                  <div className="flex items-center gap-2"><h3 className="font-bold">{scenario.displayName}</h3>{index === 0 ? <Pill tone="green">Primero</Pill> : null}</div>
                  <div className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">{scenario.leadSource === "META" ? "Meta · lead pago" : "Canal orgánico"}</div>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-[color:var(--vm-color-brand-blue)]">¿Por qué está priorizado?</div>
                <p className="mt-1.5 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{evaluation.factors.join(" · ")}</p>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-ink-muted)]">Capacidad y preparación</div>
                <div className="mt-2 text-lg font-semibold">{evaluation.capacity.estimatedHousingPayment ? `${formatCop(evaluation.capacity.estimatedHousingPayment)}/mes` : "Por completar"}</div>
                <div className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">
                  Preparación {getReadinessPresentation(evaluation.readinessScore).label.toLowerCase()} · evidencia {getEvidencePresentation(evaluation.confidenceScore).label.toLowerCase()}
                </div>
              </div>
              <Link href={`/asesor/leads/${scenario.leadId}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white">Abrir recomendación <Icon name="arrow" className="h-4 w-4" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_.72fr]">
        <div className="surface-solid p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-warning)]">No enviar a cierre</div>
              <h2 className="mt-2 text-2xl font-semibold">Leads que necesitan maduración</h2>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--vm-color-brand-yellow)]/25 text-[color:var(--vm-color-warning)]"><Icon name="heart" /></span>
          </div>
          <div className="mt-6 space-y-3">
            {nurturing.map(({ scenario, evaluation }) => (
              <Link key={scenario.leadId} href={`/asesor/leads/${scenario.leadId}`} className="flex min-h-14 items-center justify-between gap-4 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] p-4 hover:border-[color:var(--vm-color-brand-blue)]">
                <div><div className="font-semibold">{scenario.displayName}</div><div className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">{evaluation.blockers[0]}</div></div>
                <Icon name="arrow" className="h-4 w-4 text-[color:var(--vm-color-brand-blue)]" />
              </Link>
            ))}
          </div>
          <Link href="/asesor/nutricion" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[color:var(--vm-color-brand-blue)]">Abrir acompañamiento <Icon name="arrow" className="h-4 w-4" /></Link>
        </div>

        <aside className="rounded-[var(--vm-radius-elevated)] border border-[color:var(--vm-color-brand-blue)]/15 bg-[linear-gradient(145deg,#eef8ff,#fffdf1)] p-6 sm:p-8">
          <Icon name="chart" className="h-7 w-7 text-[color:var(--vm-color-brand-blue)]" />
          <h2 className="mt-5 text-2xl font-semibold tracking-[-.035em]">Una sola decisión explicable.</h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Resumen, bandeja, detalle y acompañamiento leen la misma evaluación. Cambiar de vista no modifica la prioridad ni recalcula la capacidad.</p>
        </aside>
      </section>
    </div>
  );
}

function SummaryMetric({ icon, label, value, detail, accent = false }: { icon: Parameters<typeof Icon>[0]["name"]; label: string; value: string; detail: string; accent?: boolean }) {
  return (
    <article className={`rounded-[var(--vm-radius-card)] border p-5 shadow-[var(--vm-shadow-low)] ${accent ? "border-[color:var(--vm-color-brand-blue)]/20 bg-[color:var(--vm-color-brand-blue)] text-white" : "border-[color:var(--vm-color-line)] bg-white"}`}>
      <div className="flex items-center justify-between gap-3"><div className={`text-[10px] font-bold uppercase tracking-[.1em] ${accent ? "text-white/75" : "text-[color:var(--vm-color-ink-muted)]"}`}>{label}</div><Icon name={icon} className="h-4 w-4" /></div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
      <div className={`mt-1 text-xs ${accent ? "text-white/75" : "text-[color:var(--vm-color-ink-muted)]"}`}>{detail}</div>
    </article>
  );
}
