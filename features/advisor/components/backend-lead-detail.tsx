"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { getHousingProject } from "../../../lib/housing-catalog";
import type {
  LeadDetailEvaluation,
  LeadDetailResponse,
  LeadRoute,
  ProjectRecommendation,
} from "../../../lib/api/leads";

type DetailTab = "SUMMARY" | "PROJECTS" | "CONVERSATION" | "ACTIVITY";

const routeLabels: Record<LeadRoute, string> = {
  READY_TO_CLOSE: "Listo para contacto",
  NEEDS_VALIDATION: "Validación pendiente",
  NON_AFFILIATE_REVIEW: "Revisión comercial",
  NURTURE: "Acompañamiento",
  FINANCIAL_PREPARATION: "Preparación financiera",
  OPTED_OUT: "Sin contacto",
};

export function BackendLeadDetail({
  detail,
  embedded = false,
}: {
  readonly detail: LeadDetailResponse;
  readonly embedded?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("SUMMARY");
  const evaluation = detail.evaluation;
  const tabs: Array<{ value: DetailTab; label: string; icon: Parameters<typeof Icon>[0]["name"] }> = [
    { value: "SUMMARY", label: "Resumen", icon: "document" },
    { value: "PROJECTS", label: "Proyectos", icon: "building" },
    { value: "CONVERSATION", label: "Conversación", icon: "mail" },
    { value: "ACTIVITY", label: "Auditoría", icon: "history" },
  ];

  return (
    <div className={`space-y-4 ${embedded ? "" : "mx-auto max-w-[1180px]"}`}>
      <section className="surface-solid p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.13em] text-[color:var(--vm-color-brand-blue)]">
              Detalle sincronizado desde backend
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-.05em]">
              {detail.first_name?.trim() || "Prospecto sin nombre"}
            </h1>
            <p className="mt-2 text-sm text-[color:var(--vm-color-ink-muted)]">
              {detail.source} · campaña {detail.campaign || "sin campaña"} · actualizado {formatDate(detail.updated_at)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill tone={evaluation?.priority === "HIGH" ? "green" : "yellow"}>
                {evaluation ? priorityLabel(evaluation.priority) : "Sin prioridad"}
              </Pill>
              <Pill>{evaluation ? routeLabels[evaluation.route] : "Sin evaluación"}</Pill>
              <Pill tone="gray">{detail.status}</Pill>
            </div>
          </div>
          <div className="rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.05] p-4 text-right">
            <div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-ink-muted)]">Lead ID</div>
            <div className="mt-2 max-w-[260px] break-all text-xs font-semibold">{detail.id}</div>
          </div>
        </div>

        {evaluation ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Readiness score" value={String(evaluation.readiness_score)} />
            <Metric label="Completitud" value={String(evaluation.confidence_score)} />
            <Metric label="Cuota estimada" value={formatCop(evaluation.capacity.estimated_housing_payment)} />
            <Metric label="Modelo" value={evaluation.model_version} />
          </div>
        ) : (
          <div className="mt-6 rounded-[var(--vm-radius-control)] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Este lead todavía no tiene una evaluación backend. El perfil, la conversación y la auditoría siguen disponibles.
          </div>
        )}

        <nav aria-label="Secciones del detalle" className="mt-6 flex gap-1 overflow-x-auto border-t border-[color:var(--vm-color-line)] pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              aria-pressed={activeTab === tab.value}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-xs font-bold transition ${activeTab === tab.value ? "bg-[color:var(--vm-color-brand-blue)] text-white" : "text-[color:var(--vm-color-ink-muted)] hover:bg-[color:var(--vm-color-brand-blue)]/[.05]"}`}
            >
              <Icon name={tab.icon} className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </section>

      {activeTab === "SUMMARY" ? <SummaryPanel detail={detail} /> : null}
      {activeTab === "PROJECTS" ? <RecommendationsPanel recommendations={evaluation?.recommendations ?? []} /> : null}
      {activeTab === "CONVERSATION" ? <ConversationPanel detail={detail} /> : null}
      {activeTab === "ACTIVITY" ? <ActivityPanel detail={detail} /> : null}
    </div>
  );
}

function SummaryPanel({ detail }: { readonly detail: LeadDetailResponse }) {
  const evaluation = detail.evaluation;
  return (
    <>
      <section className="surface-solid p-6 sm:p-8">
        <SectionHeading title="Perfil y contexto" description="Datos recibidos en la sesión de perfilamiento." />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Fact label="Fuente" value={detail.source} />
          <Fact label="Campaña" value={detail.campaign} />
          <Fact label="Contenido" value={detail.content} />
          <Fact label="Estado" value={detail.status} />
          <Fact label="Consentimiento" value={detail.consent_accepted_at ? formatDate(detail.consent_accepted_at) : "No registrado"} />
          <Fact label="Creado" value={formatDate(detail.created_at)} />
        </div>
      </section>

      <section className="surface-solid p-6 sm:p-8">
        <SectionHeading title="Lo que sabemos del prospecto" description="El perfil se conserva con las claves entregadas por el backend." />
        <KeyValueGrid values={detail.profile} emptyLabel="Sin datos de perfil" />
      </section>

      <section className="surface-solid p-6 sm:p-8">
        <SectionHeading title="Lo que descubrió la conversación" description="Contexto declarado por el prospecto durante la orientación." />
        <KeyValueGrid values={detail.discovery} emptyLabel="Sin discovery registrado" />
      </section>

      {evaluation ? (
        <section className="surface-solid p-6 sm:p-8">
          <SectionHeading title="Evaluación y siguiente paso" description="Resultado calculado por las reglas y el recomendador del backend." />
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <ListBlock title="Códigos de razón" values={evaluation.reason_codes} emptyLabel="Sin códigos registrados" />
            <ListBlock title="Bloqueadores" values={evaluation.blockers} emptyLabel="Sin bloqueadores registrados" />
          </div>
          <div className="mt-5 rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.04] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Siguiente acción</div>
            <p className="mt-2 text-sm font-semibold leading-6">{evaluation.next_action}</p>
          </div>
          <CapacityPanel capacity={evaluation.capacity} />
        </section>
      ) : null}
    </>
  );
}

function RecommendationsPanel({ recommendations }: { readonly recommendations: ProjectRecommendation[] }) {
  if (!recommendations.length) {
    return (
      <section className="surface-solid p-10 text-center">
        <Icon name="building" className="mx-auto h-7 w-7 text-[color:var(--vm-color-brand-blue)]" />
        <h2 className="mt-3 font-semibold">No hay recomendaciones disponibles</h2>
        <p className="mt-1 text-sm text-[color:var(--vm-color-ink-muted)]">El backend todavía no generó coincidencias para este lead.</p>
      </section>
    );
  }

  return (
    <section className="surface-solid p-6 sm:p-8">
      <SectionHeading title="Recomendaciones del backend" description="Afinidad calculada por el modelo y recursos oficiales disponibles." />
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {recommendations
          .slice()
          .sort((left, right) => left.rank - right.rank)
          .map((recommendation) => (
            <RecommendationCard key={`${recommendation.project_id}-${recommendation.rank}`} recommendation={recommendation} />
          ))}
      </div>
    </section>
  );
}

function RecommendationCard({ recommendation }: { readonly recommendation: ProjectRecommendation }) {
  const localProject = getHousingProject(recommendation.project_id);
  return (
    <article className="rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Recomendación {recommendation.rank}</div>
          <h3 className="mt-2 text-lg font-semibold">{recommendation.project_name}</h3>
        </div>
        <Pill tone="blue">{recommendation.score.toFixed(1)}</Pill>
      </div>
      <p className="mt-3 text-[11px] font-semibold text-[color:var(--vm-color-ink-muted)]">Fuente: {recommendation.model_source}</p>
      <ul className="mt-4 space-y-2 text-sm leading-5">
        {recommendation.reasons.map((reason) => <li key={reason}>• {reason}</li>)}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
        {localProject ? <Link className="rounded-full bg-[color:var(--vm-color-brand-blue)] px-3 py-2 text-white" href={`/vivienda/proyectos/${recommendation.project_id}`}>Ver ficha</Link> : null}
        {recommendation.brochure_url ? <ExternalLink href={recommendation.brochure_url} label="Folleto" /> : null}
        {recommendation.tour_urls.map((url, index) => <ExternalLink key={url} href={url} label={`Recorrido ${index + 1}`} />)}
      </div>
    </article>
  );
}

function ConversationPanel({ detail }: { readonly detail: LeadDetailResponse }) {
  return (
    <section className="surface-solid p-6 sm:p-8">
      <SectionHeading title="Conversación completa" description="Evidencia original de lo declarado y de la orientación entregada." />
      {detail.turns.length ? (
        <ol className="mt-5 space-y-5">
          {detail.turns.map((turn) => (
            <li key={turn.id} className="space-y-3">
              <div className="ml-auto max-w-[88%] rounded-[20px_20px_6px_20px] bg-[color:var(--vm-color-brand-blue)] p-4 text-sm leading-6 text-white">{turn.user_text}</div>
              <div className="max-w-[88%] rounded-[20px_20px_20px_6px] border border-[color:var(--vm-color-line)] bg-[color:var(--vm-color-canvas)] p-4 text-sm leading-6">
                <p>{turn.assistant_text}</p>
                <time className="mt-2 block text-[10px] text-[color:var(--vm-color-ink-muted)]">{formatDate(turn.created_at)}</time>
                {turn.extracted_fields.length ? <p className="mt-2 text-[10px] text-[color:var(--vm-color-ink-muted)]">Señales: {turn.extracted_fields.join(", ")}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      ) : <EmptyPanel label="No hay conversación registrada para este lead." />}
    </section>
  );
}

function ActivityPanel({ detail }: { readonly detail: LeadDetailResponse }) {
  const evaluation = detail.evaluation;
  return (
    <>
      <section className="surface-solid p-6 sm:p-8">
        <SectionHeading title="Auditoría del lead" description="Trazabilidad de sincronizaciones y decisiones del backend." />
        {detail.audit_events.length ? (
          <ol className="mt-5 space-y-4">
            {detail.audit_events.map((event, index) => (
              <li key={`${event.event_type}-${event.created_at}-${index}`} className="border-l-2 border-[color:var(--vm-color-brand-blue)]/25 pl-4">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm">{event.event_type}</strong>
                  <Pill tone="gray">{event.actor}</Pill>
                </div>
                <time className="mt-1 block text-[10px] text-[color:var(--vm-color-ink-muted)]">{formatDate(event.created_at)}</time>
                <pre className="mt-2 overflow-x-auto rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-canvas)] p-3 text-[10px] leading-5">{JSON.stringify(event.payload, null, 2)}</pre>
              </li>
            ))}
          </ol>
        ) : <EmptyPanel label="No hay eventos de auditoría registrados." />}
      </section>

      {evaluation ? (
        <section className="surface-solid p-6 sm:p-8">
          <SectionHeading title="Metadatos de evaluación" description="Versiones y latencia de la evaluación utilizada." />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Reglas" value={evaluation.rule_version} />
            <Fact label="Modelo" value={evaluation.model_version} />
            <Fact label="Prompt" value={evaluation.prompt_version} />
            <Fact label="Latencia" value={`${evaluation.latency_ms} ms`} />
            <Fact label="Evaluado" value={formatDate(evaluation.evaluated_at)} />
            <Fact label="Actualizado" value={formatDate(detail.updated_at)} />
          </div>
        </section>
      ) : null}

      {detail.enrichments.length ? (
        <section className="surface-solid p-6 sm:p-8">
          <SectionHeading title="Enriquecimientos" description="Fuentes adicionales asociadas al lead." />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {detail.enrichments.map((enrichment) => (
              <div key={`${enrichment.provider}-${enrichment.created_at}`} className="rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] p-4">
                <div className="flex items-center justify-between gap-3"><strong>{enrichment.provider}</strong><Pill tone="gray">{enrichment.status}</Pill></div>
                <p className="mt-2 text-sm">{enrichment.purpose}</p>
                {enrichment.source_url ? <ExternalLink href={enrichment.source_url} label="Ver fuente" /> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function CapacityPanel({ capacity }: { readonly capacity: LeadDetailEvaluation["capacity"] }) {
  return (
    <div className="mt-5 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] p-4">
      <div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Capacidad orientativa</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="Ingreso mensual" value={formatCop(capacity.monthly_income_estimate)} />
        <Fact label="Compromiso" value={`${Math.round(capacity.commitment_ratio * 100)} %`} />
        <Fact label="Margen vivienda" value={`${Math.round(capacity.maximum_housing_ratio * 100)} %`} />
        <Fact label="Estado" value={capacity.status} />
      </div>
    </div>
  );
}

function KeyValueGrid({ values, emptyLabel }: { readonly values: Record<string, unknown>; readonly emptyLabel: string }) {
  const entries = Object.entries(values);
  if (!entries.length) return <EmptyPanel label={emptyLabel} />;
  return <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{entries.map(([key, value]) => <Fact key={key} label={humanizeKey(key)} value={formatValue(value)} />)}</div>;
}

function ListBlock({ title, values, emptyLabel }: { readonly title: string; readonly values: string[]; readonly emptyLabel: string }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">{title}</div>
      {values.length ? <ul className="mt-3 space-y-2 text-sm leading-5">{values.map((value) => <li key={value}>• {value}</li>)}</ul> : <p className="mt-3 text-sm text-[color:var(--vm-color-ink-muted)]">{emptyLabel}</p>}
    </div>
  );
}

function SectionHeading({ title, description }: { readonly title: string; readonly description: string }) {
  return <div><h2 className="text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{description}</p></div>;
}

function Fact({ label, value }: { readonly label: string; readonly value: string }) {
  return <div className="rounded-[18px] border border-[color:var(--vm-color-line)] p-4"><div className="text-[10px] uppercase tracking-[.11em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-2 break-words text-sm font-semibold">{value}</div></div>;
}

function Metric({ label, value }: { readonly label: string; readonly value: string }) {
  return <div className="rounded-[var(--vm-radius-card)] bg-[color:var(--vm-color-brand-blue)]/[.05] p-4"><div className="text-[10px] uppercase tracking-[.1em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-2 text-xl font-semibold">{value}</div></div>;
}

function ExternalLink({ href, label }: { readonly href: string; readonly label: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className="rounded-full border border-[color:var(--vm-color-line)] px-3 py-2 text-[color:var(--vm-color-brand-blue)]">{label}</a>;
}

function EmptyPanel({ label }: { readonly label: string }) {
  return <p className="mt-5 rounded-[var(--vm-radius-control)] border border-dashed border-[color:var(--vm-color-line)] p-5 text-center text-sm text-[color:var(--vm-color-ink-muted)]">{label}</p>;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatCop(value: number): string {
  if (!value) return "Por confirmar";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Por confirmar";
  if (Array.isArray(value)) return value.map((item) => formatValue(item)).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function humanizeKey(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

function priorityLabel(value: "HIGH" | "MEDIUM" | "LOW"): string {
  return value === "HIGH" ? "Prioridad alta" : value === "MEDIUM" ? "Prioridad media" : "Prioridad baja";
}
