"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { AdvisorIntelligence } from "@/features/conversation/components/advisor-intelligence";
import { useQualifiedLeads } from "@/features/conversation/components/use-qualified-leads";
import { formatCop } from "@/features/conversation/profile-copy";
import {
  calculateCommercialMetrics,
  commercialStatusLabels,
  projectCommercialOpportunities,
  type CommercialOpportunity,
} from "../commercial";
import { useCommercialStates } from "../use-commercial-states";

export function CommercialDashboard({ fullInbox = false }: { fullInbox?: boolean }) {
  const qualifiedLeads = useQualifiedLeads();
  const { states, status: storageStatus, retry } = useCommercialStates();
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const now = useMemo(() => new Date(), []);
  const opportunities = useMemo(
    () => projectCommercialOpportunities(qualifiedLeads, states, now),
    [qualifiedLeads, states, now],
  );
  const metrics = useMemo(
    () => calculateCommercialMetrics(opportunities, now),
    [opportunities, now],
  );
  const filtered = useMemo(
    () =>
      opportunities.filter(({ lead, state, recommendedProject, campaignProject }) => {
        const text =
          `${lead.scenario.displayName} ${recommendedProject} ${campaignProject}`.toLowerCase();
        return (
          text.includes(query.trim().toLowerCase()) &&
          (priority === "ALL" || lead.evaluation.priority === priority) &&
          (status === "ALL" || state.status === status)
        );
      }),
    [opportunities, priority, query, status],
  );
  const selected =
    filtered.find(({ lead }) => lead.scenario.leadId === selectedLeadId) ??
    filtered[0];

  if (storageStatus === "LOADING") return <CommercialDashboardLoading fullInbox={fullInbox} />;
  if (storageStatus === "ERROR") return <CommercialDashboardError onRetry={retry} />;

  if (!fullInbox) {
    return (
      <OperationalSummary
        opportunities={opportunities}
        metrics={metrics}
        now={now}
      />
    );
  }

  return (
    <div className="space-y-4">
      <section className="surface-solid p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="relative">
            <span className="sr-only">Buscar oportunidades</span>
            <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-12 items-center justify-center text-[color:var(--vm-color-ink-muted)]">
              <Icon name="search" className="h-4 w-4" />
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="form-field search-field pl-12"
              placeholder="Buscar por persona, campaña o proyecto"
            />
          </label>
          <FilterSelect
            label="Prioridad"
            value={priority}
            onChange={setPriority}
            options={[
              ["ALL", "Todas las prioridades"],
              ["HIGH", "Prioridad alta"],
              ["MEDIUM", "Prioridad media"],
              ["LOW", "Prioridad baja"],
            ]}
          />
          <FilterSelect
            label="Estado"
            value={status}
            onChange={setStatus}
            options={[
              ["ALL", "Todos los estados"],
              ...Object.entries(commercialStatusLabels),
            ]}
          />
        </div>
      </section>

      {filtered.length ? (
        <section className="grid min-h-[680px] gap-4 xl:grid-cols-[minmax(300px,38fr)_minmax(0,62fr)]">
          <aside className="surface-solid h-fit overflow-hidden xl:sticky xl:top-20">
            <div className="border-b border-[color:var(--vm-color-line)] px-4 py-3">
              <h2 className="text-sm font-semibold">Oportunidades</h2>
              <p className="mt-0.5 text-[11px] text-[color:var(--vm-color-ink-muted)]">
                {filtered.length} resultados · selección conservada al revisar
              </p>
            </div>
            <div className="max-h-[calc(100vh-190px)] divide-y divide-[color:var(--vm-color-line)] overflow-y-auto">
              {filtered.map((opportunity, index) => (
                <OpportunitySelector
                  key={opportunity.lead.scenario.leadId}
                  opportunity={opportunity}
                  first={index === 0}
                  selected={
                    selected?.lead.scenario.leadId ===
                    opportunity.lead.scenario.leadId
                  }
                  onSelect={() =>
                    setSelectedLeadId(opportunity.lead.scenario.leadId)
                  }
                />
              ))}
            </div>
          </aside>

          <div
            key={selected.lead.scenario.leadId}
            className="advisor-detail-enter min-w-0"
          >
            <AdvisorIntelligence
              leadId={selected.lead.scenario.leadId}
              embedded
            />
          </div>
        </section>
      ) : (
        <EmptyInbox />
      )}
    </div>
  );
}

function OperationalSummary({
  opportunities,
  metrics,
  now,
}: {
  opportunities: CommercialOpportunity[];
  metrics: ReturnType<typeof calculateCommercialMetrics>;
  now: Date;
}) {
  return (
    <div className="space-y-4">
      <section
        className="surface-solid grid divide-y divide-[color:var(--vm-color-line)] overflow-hidden sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4"
        aria-label="Indicadores de trabajo"
      >
        <CompactMetric label="Vencidos" value={metrics.overdueFollowUps} warning />
        <CompactMetric label="Sin asignar" value={metrics.unassigned} />
        <CompactMetric label="Primer contacto" value={metrics.pendingFirstContact} />
        <CompactMetric label="Contactadas hoy" value={metrics.contactedToday} />
      </section>

      <section className="surface-solid overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-[color:var(--vm-color-line)] px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.12em] text-[color:var(--vm-color-brand-blue)]">
              Prioridades de hoy
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-[-.03em]">
              A quién atender y qué hacer
            </h2>
          </div>
          <Link
            href="/asesor/leads"
            className="inline-flex min-h-10 items-center gap-2 text-xs font-bold text-[color:var(--vm-color-brand-blue)]"
          >
            Ver todas las oportunidades <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>

        {opportunities.length ? (
          <div className="divide-y divide-[color:var(--vm-color-line)]">
            {opportunities.slice(0, 6).map((opportunity, index) => {
              const work = getWorkPriority(opportunity, now);
              return (
                <article
                  key={opportunity.lead.scenario.leadId}
                  className="advisor-row-enter grid gap-3 px-5 py-4 lg:grid-cols-[minmax(190px,.85fr)_minmax(220px,1.2fr)_minmax(180px,.8fr)_auto] lg:items-center"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] text-xs font-bold text-white">
                      {opportunity.lead.scenario.displayName.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold">
                          {opportunity.lead.scenario.displayName}
                        </h3>
                        {index === 0 ? <Pill tone="green">Atender primero</Pill> : null}
                      </div>
                      <p className="mt-1 text-[11px] text-[color:var(--vm-color-ink-muted)]">
                        {opportunity.location} · {opportunity.horizon}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{work.reason}</p>
                    <p className="mt-1 text-[11px] text-[color:var(--vm-color-ink-muted)]">
                      {opportunity.recommendedProject} ·{" "}
                      {opportunity.capacity
                        ? `${formatCop(opportunity.capacity)}/mes`
                        : "Capacidad por confirmar"}
                    </p>
                  </div>
                  <div>
                    <Pill tone={work.tone}>{work.urgency}</Pill>
                    <p className="mt-1.5 text-xs font-semibold">{work.action}</p>
                  </div>
                  <Link
                    href={`/asesor/leads/${opportunity.lead.scenario.leadId}`}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-4 text-xs font-bold text-white"
                  >
                    Gestionar <Icon name="arrow" className="h-4 w-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center">
            <Icon name="check" className="mx-auto h-7 w-7 text-[color:var(--vm-color-success)]" />
            <h3 className="mt-3 font-semibold">No hay prioridades pendientes</h3>
            <p className="mt-1 text-sm text-[color:var(--vm-color-ink-muted)]">
              Las oportunidades calificadas aparecerán aquí.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function OpportunitySelector({
  opportunity,
  first,
  selected,
  onSelect,
}: {
  opportunity: CommercialOpportunity;
  first: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const { lead, state } = opportunity;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full px-4 py-4 text-left transition ${
        selected
          ? "bg-[color:var(--vm-color-brand-blue)]/[.07] shadow-[inset_3px_0_0_var(--vm-color-brand-blue)]"
          : "bg-white hover:bg-[color:var(--vm-color-brand-blue)]/[.025]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold">{lead.scenario.displayName}</h3>
            {first ? <Pill tone="green">Primero</Pill> : null}
          </div>
          <p className="mt-1 truncate text-[11px] text-[color:var(--vm-color-ink-muted)]">
            {opportunity.recommendedProject}
          </p>
        </div>
        <Pill tone={lead.evaluation.priority === "HIGH" ? "green" : "yellow"}>
          {lead.evaluation.priority === "HIGH"
            ? "Alta"
            : lead.evaluation.priority === "MEDIUM"
              ? "Media"
              : "Baja"}
        </Pill>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-[11px]">
        <span>{commercialStatusLabels[state.status]}</span>
        <span className="text-[color:var(--vm-color-ink-muted)]">
          {formatDuration(opportunity.ageInMinutes)} sin atención
        </span>
      </div>
    </button>
  );
}

function getWorkPriority(opportunity: CommercialOpportunity, now: Date) {
  const { state, lead, ageInMinutes } = opportunity;
  if (state.followUpAt && new Date(state.followUpAt).getTime() < now.getTime()) {
    return {
      urgency: "Seguimiento vencido",
      reason: `Actividad pendiente desde ${formatDateTime(state.followUpAt)}`,
      action: "Retomar contacto",
      tone: "red" as const,
    };
  }
  if (!state.assignedTo) {
    return {
      urgency: `Sin atender · ${formatDuration(ageInMinutes)}`,
      reason: `Prioridad ${priorityLabel(lead.evaluation.priority)} y horizonte ${opportunity.horizon}`,
      action: "Tomar oportunidad",
      tone: "yellow" as const,
    };
  }
  if (!state.firstContactAt) {
    return {
      urgency: "Primer contacto pendiente",
      reason: "La oportunidad ya tiene responsable, pero aún no registra contacto",
      action: "Registrar contacto",
      tone: "blue" as const,
    };
  }
  if (state.followUpAt) {
    return {
      urgency: formatDateTime(state.followUpAt),
      reason: "Seguimiento comercial programado",
      action: "Cumplir seguimiento",
      tone: "green" as const,
    };
  }
  return {
    urgency: commercialStatusLabels[state.status],
    reason: lead.evaluation.factors[0] ?? lead.evaluation.commercialSummary,
    action: "Definir siguiente acción",
    tone: "blue" as const,
  };
}

function CompactMetric({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <article className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-ink-muted)]">
          {label}
        </div>
        <div className={`mt-1 text-2xl font-semibold ${warning && value ? "text-rose-700" : ""}`}>
          {value}
        </div>
      </div>
      <Icon
        name={warning ? "alert" : "chart"}
        className={`h-4 w-4 ${warning && value ? "text-rose-700" : "text-[color:var(--vm-color-brand-blue)]"}`}
      />
    </article>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-full border border-[color:var(--vm-color-line)] bg-white px-4 text-xs font-semibold"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyInbox() {
  return (
    <section className="surface-solid p-10 text-center">
      <Icon name="search" className="mx-auto h-7 w-7 text-[color:var(--vm-color-brand-blue)]" />
      <h2 className="mt-3 font-semibold">No hay oportunidades con estos filtros</h2>
      <p className="mt-1 text-sm text-[color:var(--vm-color-ink-muted)]">
        Ajusta la búsqueda o los filtros. Los prospectos en preparación permanecen en Nutrición.
      </p>
    </section>
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.floor(hours / 24)} d`;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function priorityLabel(value: "HIGH" | "MEDIUM" | "LOW"): string {
  return value === "HIGH" ? "alta" : value === "MEDIUM" ? "media" : "baja";
}

function CommercialDashboardLoading({ fullInbox }: { fullInbox: boolean }) {
  return (
    <div aria-live="polite" aria-busy="true" className="space-y-4">
      <div className="h-20 animate-pulse rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white" />
      <div
        className={`grid gap-4 ${fullInbox ? "xl:grid-cols-[38fr_62fr]" : ""}`}
      >
        <div className="h-[420px] animate-pulse rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white" />
        {fullInbox ? (
          <div className="h-[620px] animate-pulse rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white" />
        ) : null}
      </div>
      <span className="sr-only">Cargando oportunidades comerciales</span>
    </div>
  );
}

function CommercialDashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <section role="alert" className="surface-solid p-9 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-700">
        <Icon name="alert" />
      </span>
      <h2 className="mt-4 text-xl font-semibold">No pudimos leer la gestión comercial local.</h2>
      <p className="mt-2 text-sm text-[color:var(--vm-color-ink-muted)]">
        Las evaluaciones no fueron modificadas. Intenta cargar nuevamente la información guardada en este dispositivo.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 min-h-11 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white"
      >
        Intentar nuevamente
      </button>
    </section>
  );
}
