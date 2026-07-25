"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { getHousingProject } from "../../../lib/housing-catalog";
import { ApiError } from "../../../lib/api/client";
import {
  listActivities,
  type CommercialActivity,
  type LeadDetailEvaluation,
  type LeadDetailResponse,
  type LeadRoute,
  type ProjectRecommendation,
} from "../../../lib/api/leads";
import {
  claimLeadAndRefresh,
  createActivityAndRefresh,
  type CommercialLeadSnapshot,
  updateWorkflowAndRefresh,
} from "../../../lib/api/commercial-operations";
import { getCommercialErrorMessage } from "../../../lib/api/commercial-errors";
import {
  ACTIVITY_TYPE_LABELS,
  resolveActivityAttempt,
  type ActivityAttempt,
} from "../commercial-ui-model";

function isCommercialWorkflowMissing(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.status !== 404) return false;
  const detail = (error.details as { detail?: { code?: string } } | null)?.detail;
  return detail?.code === "COMMERCIAL_WORKFLOW_NOT_FOUND";
}

type DetailTab = "SUMMARY" | "PROJECTS" | "CONVERSATION" | "ACTIVITY";

const routeLabels: Record<LeadRoute, string> = {
  READY_TO_CLOSE: "Listo para contacto",
  NEEDS_VALIDATION: "Validación pendiente",
  NON_AFFILIATE_REVIEW: "Revisión comercial",
  NURTURE: "Acompañamiento",
  FINANCIAL_PREPARATION: "Preparación financiera",
  OPTED_OUT: "Sin contacto",
};

type ActivityStatus = "LOADING" | "READY" | "EMPTY" | "ERROR";

export function BackendLeadDetail({
  detail: initialDetail,
  embedded = false,
}: {
  readonly detail: LeadDetailResponse;
  readonly embedded?: boolean;
}) {
  const [detail, setDetail] = useState(initialDetail);
  const [activeTab, setActiveTab] = useState<DetailTab>("SUMMARY");
  const [activities, setActivities] = useState<CommercialActivity[]>([]);
  const [activityStatus, setActivityStatus] = useState<ActivityStatus>("LOADING");
  const [activityError, setActivityError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (activeTab !== "ACTIVITY") return;
    let cancelled = false;
    listActivities(detail.id)
      .then((response) => {
        if (cancelled) return;
        setActivities(response);
        setActivityStatus(response.length === 0 ? "EMPTY" : "READY");
        setActivityError("");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (isCommercialWorkflowMissing(error)) {
          setActivities([]);
          setActivityStatus("EMPTY");
          setActivityError("");
          return;
        }
        setActivityStatus("ERROR");
        setActivityError(
          error instanceof Error
            ? error.message
            : "No pudimos cargar el historial de actividades.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [detail.id, refreshTick, activeTab]);

  const evaluation = detail.evaluation;
  const journey = detail.journey;
  const tabs: Array<{ value: DetailTab; label: string; icon: Parameters<typeof Icon>[0]["name"] }> = [
    { value: "SUMMARY", label: "Resumen", icon: "document" },
    { value: "PROJECTS", label: "Proyectos", icon: "building" },
    { value: "CONVERSATION", label: "Conversación", icon: "mail" },
    { value: "ACTIVITY", label: "Actividades", icon: "history" },
  ];

  return (
    <div className={`space-y-4 ${embedded ? "" : "mx-auto max-w-[1180px]"}`}>
      <section className="surface-solid p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.11em] text-[color:var(--vm-color-brand-blue)]">
              Oportunidad comercial
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
            <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">Referencia</div>
            <div className="mt-2 max-w-[260px] break-all text-xs font-semibold">{detail.id}</div>
          </div>
        </div>

        {journey ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Preparación"
              value={readinessLabels[journey.readiness.level]}
            />
            <Metric
              label="Información pendiente"
              value={`${journey.readiness.missing_fields.length}`}
            />
            <Metric label="Cuota estimada" value={formatCop(journey.capacity.estimated_monthly_payment ?? 0)} />
            <Metric label="Siguiente acción" value={journey.handoff.next_action} />
          </div>
        ) : (
          <div className="surface-warning-soft mt-6 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-warning)]/25 p-4 text-sm text-[color:var(--vm-color-warning)]">
            Esta oportunidad todavía no cuenta con una evaluación. El perfil, la conversación y la trazabilidad siguen disponibles.
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

      {activeTab === "SUMMARY" ? (
        <>
          <AdvisorActionsPanel detail={detail} onChanged={refreshAfterMutation} />
          <SummaryPanel detail={detail} />
        </>
      ) : null}
      {activeTab === "PROJECTS" ? <RecommendationsPanel recommendations={journey?.recommendations ?? []} /> : null}
      {activeTab === "CONVERSATION" ? <ConversationPanel detail={detail} /> : null}
      {activeTab === "ACTIVITY" ? (
        <ActivityPanel
          detail={detail}
          activities={activities}
          activityStatus={activityStatus}
          activityError={activityError}
          onRetry={() => setRefreshTick((current) => current + 1)}
        />
      ) : null}
    </div>
  );

  function refreshAfterMutation(snapshot: CommercialLeadSnapshot): void {
    setDetail(snapshot.lead);
    setActivities(snapshot.activities);
    setActivityStatus(snapshot.activities.length ? "READY" : "EMPTY");
    setActivityError("");
    setRefreshTick((current) => current + 1);
  }
}

function SummaryPanel({ detail }: { readonly detail: LeadDetailResponse }) {
  const evaluation = detail.evaluation;
  const journey = detail.journey;
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
        <SectionHeading title="Lo que sabemos del prospecto" description="Información disponible antes y durante la orientación." />
        <KeyValueGrid values={detail.profile} emptyLabel="Sin datos de perfil" />
      </section>

      <section className="surface-solid p-6 sm:p-8">
        <SectionHeading title="Lo que descubrió la conversación" description="Contexto declarado por el prospecto durante la orientación." />
        <KeyValueGrid values={detail.discovery} emptyLabel="Sin discovery registrado" />
      </section>

      {journey ? (
        <section className="surface-solid p-6 sm:p-8">
          <SectionHeading title="Evaluación y siguiente paso" description="Resultado sustentado en reglas verificables y la información disponible." />
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <ListBlock title="Factores observables" values={journey.readiness.factors} emptyLabel="Sin factores adicionales" />
            <ListBlock title="Condiciones pendientes" values={journey.readiness.blockers} emptyLabel="Sin condiciones pendientes" />
          </div>
          <div className="mt-5 rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.04] p-4">
            <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">Siguiente acción</div>
            <p className="mt-2 text-sm font-semibold leading-6">
              {journey.handoff.next_action}
            </p>
          </div>
          {evaluation ? <CapacityPanel capacity={evaluation.capacity} /> : null}
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
        <p className="mt-1 text-sm text-[color:var(--vm-color-ink-muted)]">Todavía no hay proyectos compatibles para esta oportunidad.</p>
      </section>
    );
  }

  return (
    <section className="surface-solid p-6 sm:p-8">
      <SectionHeading title="Proyectos compatibles" description="Opciones priorizadas según el perfil y los recursos disponibles." />
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
          <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">Opción {recommendation.rank}</div>
          <h3 className="mt-2 text-lg font-semibold">{recommendation.project_name}</h3>
        </div>
        <Pill tone="blue">{recommendation.purpose === "MATCH" ? "Coincidencia" : "Referencia"}</Pill>
      </div>
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
                <time className="mt-2 block text-xs text-[color:var(--vm-color-ink-muted)]">{formatDate(turn.created_at)}</time>
                {turn.extracted_fields.length ? <p className="mt-2 text-xs text-[color:var(--vm-color-ink-muted)]">Información identificada: {turn.extracted_fields.map(humanizeKey).join(", ")}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      ) : <EmptyPanel label="No hay conversación registrada para esta oportunidad." />}
    </section>
  );
}

function ActivityPanel({
  detail,
  activities,
  activityStatus,
  activityError,
  onRetry,
}: {
  readonly detail: LeadDetailResponse;
  readonly activities: CommercialActivity[];
  readonly activityStatus: ActivityStatus;
  readonly activityError: string;
  readonly onRetry: () => void;
}) {
  const evaluation = detail.evaluation;
  return (
    <>
      <section className="surface-solid p-6 sm:p-8">
        <SectionHeading
          title="Actividades registradas"
          description="Acciones del asesor sobre esta oportunidad, en orden cronológico."
        />
        {renderActivitiesBody({ activityStatus, activityError, onRetry, activities })}
      </section>

      <section className="surface-solid p-6 sm:p-8">
        <SectionHeading title="Trazabilidad de la oportunidad" description="Eventos del sistema registrados durante el recorrido." />
        {detail.audit_events.length ? (
          <ol className="mt-5 space-y-4">
            {detail.audit_events.map((event, index) => (
              <li key={`${event.event_type}-${event.created_at}-${index}`} className="border-l-2 border-[color:var(--vm-color-brand-blue)]/25 pl-4">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm">{humanizeKey(event.event_type)}</strong>
                  <Pill tone="gray">{humanizeKey(event.actor)}</Pill>
                </div>
                <time className="mt-1 block text-xs text-[color:var(--vm-color-ink-muted)]">{formatDate(event.created_at)}</time>
              </li>
            ))}
          </ol>
        ) : <EmptyPanel label="No hay eventos de auditoría registrados." />}
      </section>

      {evaluation ? (
        <section className="surface-solid p-6 sm:p-8">
          <SectionHeading title="Registro de evaluación" description="Versión de reglas, momento y tiempo de cálculo." />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Versión de reglas" value={evaluation.rule_version} />
            <Fact label="Evaluado" value={formatDate(evaluation.evaluated_at)} />
            <Fact label="Actualizado" value={formatDate(detail.updated_at)} />
          </div>
        </section>
      ) : null}

      {detail.enrichments.length ? (
        <section className="surface-solid p-6 sm:p-8">
          <SectionHeading title="Información complementaria" description="Fuentes adicionales asociadas a la oportunidad." />
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
      <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">Capacidad orientativa</div>
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

function renderActivitiesBody({
  activityStatus,
  activityError,
  onRetry,
  activities,
}: {
  activityStatus: ActivityStatus;
  activityError: string;
  onRetry: () => void;
  activities: CommercialActivity[];
}) {
  if (activityStatus === "LOADING") {
    return (
      <div aria-live="polite" aria-busy="true" className="mt-5 space-y-3">
        <div className="h-12 animate-pulse rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-white" />
        <div className="h-12 animate-pulse rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-white" />
        <span className="sr-only">Cargando actividades</span>
      </div>
    );
  }
  if (activityStatus === "ERROR") {
    return (
      <div className="surface-warning-soft mt-5 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-warning)]/25 p-4 text-sm text-[color:var(--vm-color-warning)]">
        <p>{activityError || "No pudimos cargar las actividades."}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex min-h-9 items-center rounded-full border border-[color:var(--vm-color-warning)]/30 bg-white px-4 text-xs font-bold text-[color:var(--vm-color-warning)]"
        >
          Reintentar
        </button>
      </div>
    );
  }
  if (activityStatus === "EMPTY") {
    return (
      <EmptyPanel label="Esta oportunidad todavía no tiene un flujo comercial. Tómala para empezar a registrar actividades." />
    );
  }
  return (
    <ol className="mt-5 space-y-4">
      {activities.map((activity) => (
        <li
          key={`${activity.id}-${activity.created_at ?? "no-date"}`}
          className="border-l-2 border-[color:var(--vm-color-brand-blue)]/25 pl-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-sm">
              {ACTIVITY_TYPE_LABELS[activity.activity_type] ??
                humanizeKey(activity.activity_type)}
            </strong>
            <Pill tone="gray">{humanizeKey(activity.advisor_id)}</Pill>
          </div>
          {activity.note ? (
            <p className="mt-1 text-sm leading-5 text-[color:var(--vm-color-ink-muted)]">
              {activity.note}
            </p>
          ) : null}
          <time className="mt-1 block text-xs text-[color:var(--vm-color-ink-muted)]">
            {formatDate(activity.created_at ?? activity.managed_at ?? null)}
          </time>
        </li>
      ))}
    </ol>
  );
}

function ListBlock({ title, values, emptyLabel }: { readonly title: string; readonly values: string[]; readonly emptyLabel: string }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">{title}</div>
      {values.length ? <ul className="mt-3 space-y-2 text-sm leading-5">{values.map((value) => <li key={value}>• {humanizeKey(value)}</li>)}</ul> : <p className="mt-3 text-sm text-[color:var(--vm-color-ink-muted)]">{emptyLabel}</p>}
    </div>
  );
}

function SectionHeading({ title, description }: { readonly title: string; readonly description: string }) {
  return <div><h2 className="text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{description}</p></div>;
}

function Fact({ label, value }: { readonly label: string; readonly value: string }) {
  return <div className="rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] p-4"><div className="text-xs uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-2 break-words text-sm font-semibold">{value}</div></div>;
}

function Metric({ label, value }: { readonly label: string; readonly value: string }) {
  return <div className="rounded-[var(--vm-radius-card)] bg-[color:var(--vm-color-brand-blue)]/[.05] p-4"><div className="text-xs uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-2 text-xl font-semibold">{value}</div></div>;
}

function ExternalLink({ href, label }: { readonly href: string; readonly label: string }) {
  const safeHref = getSafeExternalUrl(href);
  if (!safeHref) return null;
  return <a href={safeHref} target="_blank" rel="noreferrer" className="rounded-full border border-[color:var(--vm-color-line)] px-3 py-2 text-[color:var(--vm-color-brand-blue)]">{label}</a>;
}

function EmptyPanel({ label }: { readonly label: string }) {
  return <p className="mt-5 rounded-[var(--vm-radius-control)] border border-dashed border-[color:var(--vm-color-line)] p-5 text-center text-sm text-[color:var(--vm-color-ink-muted)]">{label}</p>;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Por confirmar";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Por confirmar";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatCop(value: number): string {
  if (!value) return "Por confirmar";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Por confirmar";
  if (Array.isArray(value)) return value.map((item) => formatValue(item)).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function humanizeKey(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

const PRIORITY_LABELS: Record<"HIGH" | "MEDIUM" | "LOW", string> = {
  HIGH: "Prioridad alta",
  MEDIUM: "Prioridad media",
  LOW: "Prioridad baja",
};

function priorityLabel(value: "HIGH" | "MEDIUM" | "LOW"): string {
  return PRIORITY_LABELS[value];
}

function getSafeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

const readinessLabels = {
  HIGH: "Preparación alta",
  DEVELOPING: "En desarrollo",
  INITIAL: "Etapa inicial",
};

type CommercialStateValue =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "FOLLOW_UP"
  | "APPOINTMENT_SCHEDULED"
  | "CLOSED_WON"
  | "CLOSED_LOST"
  | "OPTED_OUT";

type ActivityTypeValue =
  | "CONTACT_ATTEMPT"
  | "CONTACT_SUCCESS"
  | "FOLLOW_UP_SCHEDULED"
  | "APPOINTMENT_SCHEDULED"
  | "CLOSED_WON"
  | "CLOSED_LOST"
  | "OPTED_OUT";

type ChannelValue = "PHONE" | "WHATSAPP" | "EMAIL" | "IN_PERSON";

const COMMERCIAL_STATE_OPTIONS: ReadonlyArray<{ value: CommercialStateValue; label: string }> = [
  { value: "PENDING", label: "Pendiente" },
  { value: "ASSIGNED", label: "Asignada" },
  { value: "IN_PROGRESS", label: "En progreso" },
  { value: "FOLLOW_UP", label: "Seguimiento" },
  { value: "APPOINTMENT_SCHEDULED", label: "Cita agendada" },
  { value: "CLOSED_WON", label: "Cierre exitoso" },
  { value: "CLOSED_LOST", label: "Cierre sin conversión" },
  { value: "OPTED_OUT", label: "Sin contacto" },
];

const ACTIVITY_TYPE_OPTIONS: ReadonlyArray<{ value: ActivityTypeValue; label: string }> = [
  { value: "CONTACT_ATTEMPT", label: "Intento de contacto" },
  { value: "CONTACT_SUCCESS", label: "Contacto exitoso" },
  { value: "FOLLOW_UP_SCHEDULED", label: "Seguimiento programado" },
  { value: "APPOINTMENT_SCHEDULED", label: "Cita agendada" },
  { value: "CLOSED_WON", label: "Cierre exitoso" },
  { value: "CLOSED_LOST", label: "Cierre sin conversión" },
  { value: "OPTED_OUT", label: "Solicitud de no contacto" },
];

const CHANNEL_OPTIONS: ReadonlyArray<{ value: ChannelValue; label: string }> = [
  { value: "PHONE", label: "Teléfono" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "EMAIL", label: "Correo" },
  { value: "IN_PERSON", label: "Presencial" },
];

function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

function AdvisorActionsPanel({
  detail,
  onChanged,
}: {
  readonly detail: LeadDetailResponse;
  readonly onChanged: (snapshot: CommercialLeadSnapshot) => void;
}) {
  const workflow = detail.commercial_workflow;
  const handoff = detail.journey?.handoff;
  const handoffRequested = handoff?.requested ?? false;
  const hasWorkflow = Boolean(workflow);
  const isPendingAndUnassigned =
    workflow?.state === "PENDING" && !workflow.assigned_advisor_id;
  const needsClaim = !hasWorkflow || isPendingAndUnassigned;
  const workflowVersion = workflow?.workflow_version ?? 0;
  const currentState = (workflow?.state ?? "PENDING") as CommercialStateValue;

  const [claimBusy, setClaimBusy] = useState(false);
  const [claimError, setClaimError] = useState("");

  const [targetState, setTargetState] = useState<CommercialStateValue>(currentState);
  const [outcome, setOutcome] = useState("");
  const [workflowBusy, setWorkflowBusy] = useState(false);
  const [workflowError, setWorkflowError] = useState("");

  const [activityType, setActivityType] = useState<ActivityTypeValue>("CONTACT_ATTEMPT");
  const [channel, setChannel] = useState<ChannelValue>("PHONE");
  const [activityResult, setActivityResult] = useState("");
  const [activityNote, setActivityNote] = useState("");
  const [activityBusy, setActivityBusy] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [activitySuccess, setActivitySuccess] = useState("");
  const activityAttemptRef = useRef<ActivityAttempt | null>(null);

  function applySnapshot(snapshot: CommercialLeadSnapshot): void {
    setTargetState(snapshot.workflow.state as CommercialStateValue);
    onChanged(snapshot);
  }

  async function handleClaim() {
    setClaimBusy(true);
    setClaimError("");
    try {
      const snapshot = await claimLeadAndRefresh(detail.id);
      applySnapshot(snapshot);
    } catch (error) {
      setClaimError(getCommercialErrorMessage(error));
    } finally {
      setClaimBusy(false);
    }
  }

  async function handleWorkflowChange() {
    if (!workflowVersion) {
      setWorkflowError("La oportunidad todavía no tiene flujo comercial.");
      return;
    }
    setWorkflowBusy(true);
    setWorkflowError("");
    try {
      const snapshot = await updateWorkflowAndRefresh(detail.id, {
        state: targetState,
        expected_workflow_version: workflowVersion,
        updated_at: new Date().toISOString(),
        outcome: outcome.trim() || null,
      });
      setOutcome("");
      applySnapshot(snapshot);
    } catch (error) {
      setWorkflowError(getCommercialErrorMessage(error));
    } finally {
      setWorkflowBusy(false);
    }
  }

  async function handleCreateActivity() {
    if (!workflowVersion) {
      setActivityError("Toma la oportunidad antes de registrar una actividad.");
      return;
    }
    if (!activityResult.trim()) {
      setActivityError("Describe el resultado de la actividad.");
      return;
    }
    setActivityBusy(true);
    setActivityError("");
    setActivitySuccess("");
    const attempt = resolveActivityAttempt(
      activityAttemptRef.current,
      {
        activityType,
        channel,
        result: activityResult.trim(),
        note: activityNote.trim(),
        workflowVersion,
      },
      generateIdempotencyKey,
    );
    activityAttemptRef.current = attempt;
    const activityInput = {
      activity_type: activityType,
      channel,
      result: activityResult.trim(),
      managed_at: attempt.managedAt,
      note: activityNote.trim() || null,
      expected_workflow_version: workflowVersion,
    };
    try {
      const snapshot = await createActivityAndRefresh(
        detail.id,
        activityInput,
        attempt.key,
      );
      activityAttemptRef.current = null;
      setActivityResult("");
      setActivityNote("");
      setActivitySuccess("Actividad registrada y disponible en el historial.");
      applySnapshot(snapshot);
    } catch (error) {
      setActivityError(getCommercialErrorMessage(error));
    } finally {
      setActivityBusy(false);
    }
  }

  return (
    <section className="surface-solid p-6 sm:p-8" data-testid="advisor-actions">
      <SectionHeading
        title="Acciones del asesor"
        description={
          !handoffRequested
            ? "Esta oportunidad todavía no tiene flujo comercial porque el prospecto no ha solicitado contacto."
            : needsClaim
              ? "Esta oportunidad está disponible. Tómala para empezar a gestionarla."
              : "Cambia el estado, registra una actividad o consulta la trazabilidad."
        }
      />

      {!handoffRequested ? (
        <div
          className="surface-warning-soft mt-5 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-warning)]/25 p-4 text-sm text-[color:var(--vm-color-warning)]"
          data-testid="handoff-required"
        >
          <p className="font-semibold">El prospecto aún no ha solicitado contacto.</p>
          <p className="mt-1 leading-5">
            El flujo comercial solo se activa después de que el prospecto complete la orientación y
            pida hablar con un asesor. Esta oportunidad aparecerá aquí automáticamente cuando lo
            haga.
          </p>
        </div>
      ) : needsClaim ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleClaim}
            disabled={claimBusy}
            data-testid="claim-button"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white disabled:opacity-60"
          >
            {claimBusy ? "Tomando…" : "Tomar oportunidad"}
            <Icon name="arrow" className="h-4 w-4" />
          </button>
          {claimError ? (
            <p role="alert" className="text-sm text-[color:var(--vm-color-error)]">
              {claimError}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Pill tone="blue">Estado actual: {currentState}</Pill>
            <span className="text-xs text-[color:var(--vm-color-ink-muted)]">
              Versión del workflow: {workflowVersion}
            </span>
            {workflow ? <SlaBadge workflow={workflow} /> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="space-y-1.5 text-xs font-bold text-[color:var(--vm-color-ink-muted)]">
              <span>Nuevo estado</span>
              <select
                value={targetState}
                onChange={(event) => setTargetState(event.target.value as CommercialStateValue)}
                disabled={workflowBusy}
                data-testid="workflow-state-select"
                className="h-11 w-full rounded-full border border-[color:var(--vm-color-line)] bg-white px-4 text-sm font-semibold"
              >
                {COMMERCIAL_STATE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-bold text-[color:var(--vm-color-ink-muted)]">
              <span>Resultado o nota del cambio</span>
              <input
                value={outcome}
                onChange={(event) => setOutcome(event.target.value)}
                disabled={workflowBusy}
                placeholder="Opcional"
                data-testid="workflow-outcome-input"
                className="h-11 w-full rounded-full border border-[color:var(--vm-color-line)] bg-white px-4 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={handleWorkflowChange}
              disabled={workflowBusy || targetState === currentState}
              data-testid="workflow-apply-button"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white disabled:opacity-60"
            >
              {workflowBusy ? "Aplicando…" : "Aplicar cambio"}
            </button>
          </div>
          {workflowError ? (
            <p role="alert" className="text-sm text-[color:var(--vm-color-error)]">
              {workflowError}
            </p>
          ) : null}

          <div className="border-t border-[color:var(--vm-color-line)] pt-5">
            <h3 className="text-sm font-semibold">Registrar nueva actividad</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs font-bold text-[color:var(--vm-color-ink-muted)]">
                <span>Tipo</span>
                <select
                  value={activityType}
                  onChange={(event) => setActivityType(event.target.value as ActivityTypeValue)}
                  disabled={activityBusy}
                  data-testid="activity-type-select"
                  className="h-11 w-full rounded-full border border-[color:var(--vm-color-line)] bg-white px-4 text-sm font-semibold"
                >
                  {ACTIVITY_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-xs font-bold text-[color:var(--vm-color-ink-muted)]">
                <span>Canal</span>
                <select
                  value={channel}
                  onChange={(event) => setChannel(event.target.value as ChannelValue)}
                  disabled={activityBusy}
                  data-testid="activity-channel-select"
                  className="h-11 w-full rounded-full border border-[color:var(--vm-color-line)] bg-white px-4 text-sm font-semibold"
                >
                  {CHANNEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-xs font-bold text-[color:var(--vm-color-ink-muted)] sm:col-span-2">
                <span>Resultado (obligatorio)</span>
                <input
                  value={activityResult}
                  onChange={(event) => setActivityResult(event.target.value)}
                  disabled={activityBusy}
                  maxLength={240}
                  placeholder="Ej: Llamada contestada, agendar visita"
                  data-testid="activity-result-input"
                  className="h-11 w-full rounded-full border border-[color:var(--vm-color-line)] bg-white px-4 text-sm"
                />
              </label>
              <label className="space-y-1.5 text-xs font-bold text-[color:var(--vm-color-ink-muted)] sm:col-span-2">
                <span>Nota (opcional)</span>
                <textarea
                  value={activityNote}
                  onChange={(event) => setActivityNote(event.target.value)}
                  disabled={activityBusy}
                  maxLength={1000}
                  rows={2}
                  placeholder="Detalles relevantes para la trazabilidad"
                  data-testid="activity-note-input"
                  className="w-full rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-white p-3 text-sm"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCreateActivity}
                disabled={activityBusy}
                data-testid="activity-submit-button"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white disabled:opacity-60"
              >
                {activityBusy ? "Registrando…" : "Registrar actividad"}
              </button>
              {activityError ? (
                <p role="alert" className="text-sm text-[color:var(--vm-color-error)]">
                  {activityError}
                </p>
              ) : null}
              {activitySuccess ? (
                <output className="text-sm text-[color:var(--vm-color-success)]">
                  {activitySuccess}
                </output>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SlaBadge({
  workflow,
}: {
  readonly workflow: NonNullable<LeadDetailResponse["commercial_workflow"]>;
}) {
  const dueAt = workflow.sla_due_at;
  const [now] = useState(() => Date.now());
  if (!dueAt) return null;
  const dueDate = new Date(dueAt);
  if (Number.isNaN(dueDate.getTime())) return null;
  const ms = dueDate.getTime() - now;
  const overdue = ms < 0;
  const hours = Math.abs(Math.round(ms / (1000 * 60 * 60)));
  let label: string;
  if (overdue) {
    label = `SLA vencido hace ${hours} h`;
  } else if (hours <= 1) {
    label = "SLA vence en <1 h";
  } else {
    label = `SLA vence en ${hours} h`;
  }
  return (
    <Pill tone={overdue ? "yellow" : "gray"}>
      {label}
    </Pill>
  );
}
