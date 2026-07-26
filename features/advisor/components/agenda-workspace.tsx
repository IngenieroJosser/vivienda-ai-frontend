"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FeedbackState } from "@/components/feedback-state";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { useQualifiedLeads } from "@/features/conversation/components/use-qualified-leads";
import { buildAgendaItems, type AgendaItem } from "../agenda";
import { useCommercialStates } from "../use-commercial-states";

export function AgendaWorkspace() {
  const leads = useQualifiedLeads();
  const { states, status, retry } = useCommercialStates();
  const [currentTime, setCurrentTime] = useState(0);
  const [filter, setFilter] = useState<"ALL" | AgendaItem["timing"]>("ALL");
  useEffect(() => {
    const timer = window.setTimeout(() => setCurrentTime(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const now = useMemo(() => new Date(currentTime), [currentTime]);
  const items = useMemo(
    () => (currentTime ? buildAgendaItems(leads, states, now) : []),
    [currentTime, leads, now, states],
  );
  const visible = filter === "ALL" ? items : items.filter((item) => item.timing === filter);

  if (status === "LOADING" || !currentTime) return <AgendaLoading />;
  if (status === "ERROR") {
    return <AgendaError onRetry={retry} />;
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        <AgendaMetric label="Vencidos" value={items.filter((item) => item.timing === "OVERDUE").length} tone="red" />
        <AgendaMetric label="Para hoy" value={items.filter((item) => item.timing === "TODAY").length} tone="blue" />
        <AgendaMetric label="Próximos" value={items.filter((item) => ["TOMORROW", "NEXT_7_DAYS", "LATER"].includes(item.timing)).length} tone="green" />
      </section>

      <section className="surface-solid overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-[color:var(--vm-color-line)] p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold">Actividades comerciales</h2>
            <p className="mt-1 text-sm text-[color:var(--vm-color-ink-muted)]">Primeros contactos y seguimientos derivados del estado local de cada oportunidad.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {([["ALL", "Todas"], ["OVERDUE", "Vencidas"], ["TODAY", "Hoy"], ["TOMORROW", "Mañana"], ["NEXT_7_DAYS", "Próximos 7 días"], ["NO_DATE", "Sin fecha"]] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={`min-h-10 rounded-full px-4 text-xs font-bold ${filter === value ? "bg-[color:var(--vm-color-brand-blue)] text-white" : "border border-[color:var(--vm-color-line)] bg-white"}`}>{label}</button>
            ))}
          </div>
        </div>

        {visible.length ? (
          <div className="divide-y divide-[color:var(--vm-color-line)]">
            {visible.map((item) => <AgendaRow key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="p-10 text-center">
            <Icon name="calendar" className="mx-auto h-7 w-7 text-[color:var(--vm-color-brand-blue)]" />
            <h3 className="mt-3 font-semibold">No hay actividades en este grupo</h3>
            <p className="mt-1 text-sm text-[color:var(--vm-color-ink-muted)]">Los seguimientos aparecerán al programarlos desde una oportunidad.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function AgendaRow({ item }: { item: AgendaItem }) {
  return (
    <article className="advisor-row-enter grid gap-4 p-5 sm:p-6 lg:grid-cols-[150px_1fr_180px_auto] lg:items-center">
      <div>
        <Pill tone={item.timing === "OVERDUE" ? "red" : item.timing === "TODAY" ? "blue" : item.timing === "NO_DATE" ? "yellow" : "green"}>
          {timingLabel(item.timing)}
        </Pill>
        {item.dueAt ? <time className="mt-2 block text-xs font-semibold">{formatDateTime(item.dueAt)}</time> : <span className="mt-2 block text-xs font-semibold">Fecha por definir</span>}
      </div>
      <div>
        <h3 className="font-semibold">{item.prospectName}</h3>
        <p className="mt-1 text-sm">{item.title}</p>
        <p className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">{item.nextAction}</p>
      </div>
      <div className="text-xs">
        <div className="text-[color:var(--vm-color-ink-muted)]">Estado</div>
        <div className="mt-1 font-semibold">{item.commercialStatus} · prioridad {priorityLabel(item.priority)}</div>
      </div>
      <Link href={`/asesor/leads/${item.leadId}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-4 text-xs font-bold text-white">
        Abrir oportunidad <Icon name="arrow" className="h-4 w-4" />
      </Link>
    </article>
  );
}

function AgendaMetric({ label, value, tone }: { label: string; value: number; tone: "red" | "blue" | "green" }) {
  const colors = tone === "red" ? "bg-[color:var(--vm-color-error-soft)] text-[color:var(--vm-color-error)]" : tone === "green" ? "bg-[color:var(--vm-color-success-soft)] text-[color:var(--vm-color-success)]" : "bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]";
  return <article className="surface-solid flex items-center justify-between p-5"><div><div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-2 text-3xl font-semibold">{value}</div></div><span className={`grid h-10 w-10 place-items-center rounded-full ${colors}`}><Icon name="calendar" className="h-4 w-4" /></span></article>;
}

function AgendaLoading() {
  return <div aria-busy="true" className="space-y-5"><div className="grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-[var(--vm-radius-card)] bg-white" />)}</div><div className="h-80 animate-pulse rounded-[var(--vm-radius-card)] bg-white" /></div>;
}

function AgendaError({ onRetry }: { onRetry: () => void }) {
  return (
    <FeedbackState
      title="No pudimos cargar la agenda local"
      description="Las actividades guardadas permanecen en este dispositivo."
      icon="alert"
      tone="error"
      action={{ label: "Intentar nuevamente", onClick: onRetry }}
    />
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function priorityLabel(value: AgendaItem["priority"]): string {
  return value === "HIGH" ? "alta" : value === "MEDIUM" ? "media" : "baja";
}

function timingLabel(value: AgendaItem["timing"]): string {
  return {
    OVERDUE: "Vencido",
    TODAY: "Hoy",
    TOMORROW: "Mañana",
    NEXT_7_DAYS: "Próximos 7 días",
    LATER: "Más adelante",
    NO_DATE: "Sin fecha",
  }[value];
}
