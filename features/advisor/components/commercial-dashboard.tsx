"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { formatCop } from "@/features/conversation/profile-copy";
import { useQualifiedLeads } from "@/features/conversation/components/use-qualified-leads";
import {
  calculateCommercialMetrics,
  commercialStatusLabels,
  projectCommercialOpportunities,
  type CommercialOpportunity,
} from "../commercial";
import { useCommercialStates } from "../use-commercial-states";

export function CommercialDashboard({
  fullInbox = false,
}: {
  fullInbox?: boolean;
}) {
  const qualifiedLeads = useQualifiedLeads();
  const { states, status: storageStatus, retry } = useCommercialStates();
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("ALL");
  const [status, setStatus] = useState("ALL");
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
          text.includes(query.toLowerCase()) &&
          (priority === "ALL" || lead.evaluation.priority === priority) &&
          (status === "ALL" || state.status === status)
        );
      }),
    [opportunities, priority, query, status],
  );
  const visible = fullInbox ? filtered : filtered.slice(0, 8);

  if (storageStatus === "LOADING") return <CommercialDashboardLoading />;
  if (storageStatus === "ERROR") {
    return (
      <CommercialDashboardError onRetry={retry} />
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon="target"
          label="Oportunidades nuevas"
          value={String(metrics.newCount)}
          detail="Calificadas para atención"
          accent
        />
        <MetricCard
          icon="user"
          label="Sin asignar"
          value={String(metrics.unassigned)}
          detail="Requieren responsable"
        />
        <MetricCard
          icon="phone"
          label="Primer contacto pendiente"
          value={String(metrics.pendingFirstContact)}
          detail={`${metrics.contactedToday} contactadas hoy`}
        />
        <MetricCard
          icon="clock"
          label="Seguimientos vencidos"
          value={String(metrics.overdueFollowUps)}
          detail={
            metrics.averageFirstContactMinutes === null
              ? "Tiempo de respuesta aún sin datos"
              : `Primer contacto promedio: ${formatDuration(metrics.averageFirstContactMinutes)}`
          }
          warning={metrics.overdueFollowUps > 0}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="surface-solid p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.13em] text-[color:var(--vm-color-brand-blue)]">
                Distribución comercial
              </div>
              <h2 className="mt-2 text-xl font-semibold">
                Prioridad de la bandeja
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <PriorityCount
                label="Alta"
                value={metrics.byPriority.HIGH}
                tone="green"
              />
              <PriorityCount
                label="Media"
                value={metrics.byPriority.MEDIUM}
                tone="yellow"
              />
              <PriorityCount label="Baja" value={metrics.byPriority.LOW} />
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[color:var(--vm-color-line)]">
            {metrics.total ? (
              <div className="flex h-full">
                <span
                  className="bg-[color:var(--vm-color-success)]"
                  style={{
                    width: `${(metrics.byPriority.HIGH / metrics.total) * 100}%`,
                  }}
                />
                <span
                  className="bg-[color:var(--vm-color-brand-yellow)]"
                  style={{
                    width: `${(metrics.byPriority.MEDIUM / metrics.total) * 100}%`,
                  }}
                />
                <span
                  className="bg-[color:var(--vm-color-brand-blue)]/35"
                  style={{
                    width: `${(metrics.byPriority.LOW / metrics.total) * 100}%`,
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>

        <aside className="rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-brand-blue)]/15 bg-[linear-gradient(140deg,#eef8ff,#fffdf0)] p-5 shadow-[var(--vm-shadow-low)]">
          <div className="flex items-center gap-2 text-[color:var(--vm-color-brand-blue)]">
            <Icon name="shield" className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-[.12em]">
              Alcance del prototipo
            </span>
          </div>
          <p className="mt-3 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
            La calificación es de solo lectura. Las acciones comerciales quedan
            auditadas localmente hasta conectar identidad, CRM y canales
            corporativos.
          </p>
        </aside>
      </section>

      <section className="surface-solid overflow-hidden">
        <div className="border-b border-[color:var(--vm-color-line)] p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.13em] text-[color:var(--vm-color-brand-blue)]">
                Bandeja priorizada
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">
                A quién contactar primero
              </h2>
              <p className="mt-2 text-sm text-[color:var(--vm-color-ink-muted)]">
                Ordenada por prioridad, propensión, horizonte, capacidad y
                antigüedad sin atención.
              </p>
            </div>
            {!fullInbox ? (
              <Link
                href="/asesor/leads"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[color:var(--vm-color-brand-blue)]"
              >
                Abrir bandeja completa <Icon name="arrow" className="h-4 w-4" />
              </Link>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <label className="relative">
              <span className="sr-only">Buscar oportunidades</span>
              <Icon
                name="search"
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--vm-color-ink-muted)]"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="form-field pl-11"
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
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="data-table min-w-[1180px]">
            <thead>
              <tr>
                <th>Oportunidad</th>
                <th>Campaña / recomendación</th>
                <th>Capacidad</th>
                <th>Horizonte</th>
                <th>Beneficios</th>
                <th>Prioridad</th>
                <th>Sin atención</th>
                <th>Estado</th>
                <th><span className="sr-only">Acción</span></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((opportunity, index) => (
                <OpportunityRow
                  key={opportunity.lead.scenario.leadId}
                  opportunity={opportunity}
                  first={index === 0}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-[color:var(--vm-color-line)] lg:hidden">
          {visible.map((opportunity, index) => (
            <OpportunityCard
              key={opportunity.lead.scenario.leadId}
              opportunity={opportunity}
              first={index === 0}
            />
          ))}
        </div>

        {!visible.length ? (
          <div className="p-10 text-center">
            <Icon
              name="search"
              className="mx-auto h-7 w-7 text-[color:var(--vm-color-brand-blue)]"
            />
            <h3 className="mt-3 font-semibold">No hay oportunidades con estos filtros</h3>
            <p className="mt-1 text-sm text-[color:var(--vm-color-ink-muted)]">
              La bandeja no mezcla prospectos que aún están en nutrición.
            </p>
          </div>
        ) : null}

        <div className="border-t border-[color:var(--vm-color-line)] px-5 py-4 text-xs text-[color:var(--vm-color-ink-muted)]">
          {filtered.length} de {opportunities.length} oportunidades calificadas ·
          Nutrición se gestiona en un espacio separado.
        </div>
      </section>
    </div>
  );
}

function OpportunityRow({
  opportunity,
  first,
}: {
  opportunity: CommercialOpportunity;
  first: boolean;
}) {
  const { lead, state } = opportunity;
  const evaluation = lead.evaluation;
  return (
    <tr>
      <td>
        <Link
          href={`/asesor/leads/${lead.scenario.leadId}`}
          className="flex items-center gap-3"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] text-xs font-bold text-white">
            {lead.scenario.displayName.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <div className="flex items-center gap-2 font-semibold">
              {lead.scenario.displayName}
              {first ? <Pill tone="green">Primero</Pill> : null}
            </div>
            <div className="mt-1 text-[10px] text-[color:var(--vm-color-ink-muted)]">
              {opportunity.location} · {lead.scenario.leadSource === "META" ? "Meta" : "Canal propio"}
            </div>
          </div>
        </Link>
      </td>
      <td>
        <div className="text-xs text-[color:var(--vm-color-ink-muted)]">
          {opportunity.campaignProject}
        </div>
        <div className="mt-1 font-semibold">{opportunity.recommendedProject}</div>
      </td>
      <td className="font-semibold">
        {opportunity.capacity ? `${formatCop(opportunity.capacity)}/mes` : "Por confirmar"}
      </td>
      <td>{opportunity.horizon}</td>
      <td>{opportunity.detectedBenefits.length || "Por validar"}</td>
      <td>
        <Pill tone={evaluation.priority === "HIGH" ? "green" : "yellow"}>
          {evaluation.priority === "HIGH" ? "Alta" : evaluation.priority === "MEDIUM" ? "Media" : "Baja"} · {evaluation.readinessScore}
        </Pill>
      </td>
      <td>{formatDuration(opportunity.ageInMinutes)}</td>
      <td><Pill tone={state.status === "NEW" ? "blue" : "gray"}>{commercialStatusLabels[state.status]}</Pill></td>
      <td>
        <Link
          href={`/asesor/leads/${lead.scenario.leadId}`}
          aria-label={`Abrir oportunidad de ${lead.scenario.displayName}`}
          className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] text-white"
        >
          <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </td>
    </tr>
  );
}

function OpportunityCard({
  opportunity,
  first,
}: {
  opportunity: CommercialOpportunity;
  first: boolean;
}) {
  const { lead, state } = opportunity;
  return (
    <article className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{lead.scenario.displayName}</h3>
            {first ? <Pill tone="green">Contactar primero</Pill> : null}
          </div>
          <p className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">
            {opportunity.location} · {opportunity.horizon}
          </p>
        </div>
        <Pill tone={lead.evaluation.priority === "HIGH" ? "green" : "yellow"}>
          {lead.evaluation.readinessScore}/100
        </Pill>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <CompactFact label="Proyecto" value={opportunity.recommendedProject} />
        <CompactFact
          label="Capacidad"
          value={opportunity.capacity ? `${formatCop(opportunity.capacity)}/mes` : "Por confirmar"}
        />
        <CompactFact label="Estado" value={commercialStatusLabels[state.status]} />
        <CompactFact label="Sin atención" value={formatDuration(opportunity.ageInMinutes)} />
      </div>
      <Link
        href={`/asesor/leads/${lead.scenario.leadId}`}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-4 text-sm font-bold text-white"
      >
        Ver recomendación y actuar <Icon name="arrow" className="h-4 w-4" />
      </Link>
    </article>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  accent = false,
  warning = false,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
  warning?: boolean;
}) {
  return (
    <article
      className={`rounded-[var(--vm-radius-card)] border p-5 shadow-[var(--vm-shadow-low)] ${
        accent
          ? "border-[color:var(--vm-color-brand-blue)] bg-[color:var(--vm-color-brand-blue)] text-white"
          : warning
            ? "border-[color:var(--vm-color-warning)]/25 bg-[#fffaf0]"
            : "border-[color:var(--vm-color-line)] bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className={`text-[10px] font-bold uppercase tracking-[.1em] ${accent ? "text-white/75" : "text-[color:var(--vm-color-ink-muted)]"}`}>{label}</div>
        <span className={`grid h-9 w-9 place-items-center rounded-[12px] ${accent ? "bg-white/12" : "bg-[color:var(--vm-color-brand-blue)]/[.07] text-[color:var(--vm-color-brand-blue)]"}`}><Icon name={icon} className="h-4 w-4" /></span>
      </div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
      <div className={`mt-1 text-xs ${accent ? "text-white/75" : "text-[color:var(--vm-color-ink-muted)]"}`}>{detail}</div>
    </article>
  );
}

function PriorityCount({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "green" | "yellow";
}) {
  return <Pill tone={tone}>{label} · {value}</Pill>;
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
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}

function CompactFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.035] p-3">
      <div className="text-[9px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-ink-muted)]">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.floor(hours / 24)} d`;
}

function CommercialDashboardLoading() {
  return (
    <div aria-live="polite" aria-busy="true" className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white" />
        ))}
      </section>
      <div className="h-[420px] animate-pulse rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white" />
      <span className="sr-only">Cargando oportunidades comerciales</span>
    </div>
  );
}

function CommercialDashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <section role="alert" className="surface-solid p-9 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-700"><Icon name="alert" /></span>
      <h2 className="mt-4 text-xl font-semibold">No pudimos leer la gestión comercial local.</h2>
      <p className="mt-2 text-sm text-[color:var(--vm-color-ink-muted)]">Las evaluaciones no fueron modificadas. Intenta cargar nuevamente la información guardada en este dispositivo.</p>
      <button type="button" onClick={onRetry} className="mt-5 min-h-11 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white">Intentar nuevamente</button>
    </section>
  );
}
