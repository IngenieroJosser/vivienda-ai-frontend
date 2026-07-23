"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { Pill, ProgressBar } from "@/components/ui";
import {
  barrierLabels,
  buildNurturingPlans,
  simulateReevaluation,
  updateNurturingState,
  type NurturingBarrier,
  type NurturingPlan,
} from "@/features/nurturing/domain";
import { useNurturingStates } from "@/features/nurturing/use-nurturing-states";
import type { EvaluationResult } from "../domain";
import { useQualifiedLeads } from "./use-qualified-leads";

type Filter = "ALL" | NurturingBarrier;

export function NurturingWorkspace() {
  const qualifiedLeads = useQualifiedLeads();
  const { states, status, save, retry } = useNurturingStates();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [selectedLeadId, setSelectedLeadId] = useState<string>();
  const [simulations, setSimulations] = useState<
    Record<string, EvaluationResult>
  >({});
  const [currentTime, setCurrentTime] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => setCurrentTime(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const plans = useMemo(
    () => buildNurturingPlans(qualifiedLeads, states),
    [qualifiedLeads, states],
  );
  const filtered = useMemo(
    () =>
      filter === "ALL"
        ? plans
        : plans.filter(({ barrier }) => barrier === filter),
    [filter, plans],
  );
  const selectedPlan =
    filtered.find(({ lead }) => lead.scenario.leadId === selectedLeadId) ??
    filtered[0];
  const dueSoon = plans.filter(({ reevaluationAt }) => {
    if (!reevaluationAt) return false;
    const days =
      (new Date(reevaluationAt).getTime() - currentTime) / 86_400_000;
    return days <= 30;
  }).length;
  const readyToReview = plans.filter(({ progress }) => progress >= 80).length;
  const averageProgress = plans.length
    ? Math.round(
        plans.reduce((sum, plan) => sum + plan.progress, 0) / plans.length,
      )
    : 0;

  if (status === "LOADING") return <NurturingLoading />;
  if (status === "ERROR") return <NurturingError onRetry={retry} />;

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon="heart"
          label="En acompañamiento"
          value={String(plans.length)}
          detail="Fuera de la bandeja comercial"
          accent
        />
        <SummaryCard
          icon="calendar"
          label="Reevaluación próxima"
          value={String(dueSoon)}
          detail="En los próximos 30 días"
        />
        <SummaryCard
          icon="target"
          label="Listos para revisar"
          value={String(readyToReview)}
          detail="Progreso igual o superior al 80 %"
        />
        <SummaryCard
          icon="chart"
          label="Avance promedio"
          value={`${averageProgress}%`}
          detail="Sobre la ruta de preparación"
        />
      </section>

      <section className="surface-solid overflow-hidden">
        <div className="border-b border-[color:var(--vm-color-line)] p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.13em] text-[color:var(--vm-color-warning)]">
                Ruta de avance
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">
                Madurar no significa descartar.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
                Cada prospecto conserva una barrera concreta, una meta
                verificable y un momento claro para volver a evaluar.
              </p>
            </div>
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              aria-label="Filtrar por barrera principal"
            >
              <FilterButton
                active={filter === "ALL"}
                onClick={() => setFilter("ALL")}
              >
                Todas
              </FilterButton>
              {(Object.entries(barrierLabels) as [NurturingBarrier, string][]).map(
                ([value, label]) => (
                  <FilterButton
                    key={value}
                    active={filter === value}
                    onClick={() => setFilter(value)}
                  >
                    {label}
                  </FilterButton>
                ),
              )}
            </div>
          </div>
        </div>

        {filtered.length ? (
          <div className="grid xl:grid-cols-[minmax(0,1.05fr)_minmax(380px,.95fr)]">
            <div className="divide-y divide-[color:var(--vm-color-line)] xl:border-r xl:border-[color:var(--vm-color-line)]">
              {filtered.map((plan) => (
                <NurturingLeadRow
                  key={plan.lead.scenario.leadId}
                  plan={plan}
                  selected={
                    selectedPlan?.lead.scenario.leadId ===
                    plan.lead.scenario.leadId
                  }
                  onSelect={() =>
                    setSelectedLeadId(plan.lead.scenario.leadId)
                  }
                />
              ))}
            </div>
            {selectedPlan ? (
              <NurturingPlanDetail
                plan={selectedPlan}
                simulation={
                  simulations[selectedPlan.lead.scenario.leadId]
                }
                onSave={save}
                onSimulation={(result) =>
                  setSimulations((current) => ({
                    ...current,
                    [selectedPlan.lead.scenario.leadId]: result,
                  }))
                }
              />
            ) : null}
          </div>
        ) : (
          <NurturingEmpty filtered={filter !== "ALL"} />
        )}
      </section>
    </div>
  );
}

function NurturingLeadRow({
  plan,
  selected,
  onSelect,
}: {
  plan: NurturingPlan;
  selected: boolean;
  onSelect: () => void;
}) {
  const { scenario, evaluation } = plan.lead;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full p-5 text-left transition sm:p-6 ${
        selected
          ? "bg-[color:var(--vm-color-brand-blue)]/[.055]"
          : "bg-white hover:bg-[color:var(--vm-color-brand-blue)]/[.025]"
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-xs font-bold ${
            selected
              ? "bg-[color:var(--vm-color-brand-blue)] text-white"
              : "bg-[color:var(--vm-color-brand-yellow)]/25 text-[color:var(--vm-color-warning)]"
          }`}
        >
          {scenario.displayName.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold">{scenario.displayName}</h3>
              <p className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">
                {scenario.leadSource === "META" ? "Meta · pauta" : "Canal propio"}
              </p>
            </div>
            <Pill tone="yellow">{plan.barrierLabel}</Pill>
          </div>
          <p className="mt-4 line-clamp-2 text-sm font-semibold leading-5">
            {plan.objective}
          </p>
          <div className="mt-4">
            <ProgressBar value={plan.progress} label="Avance hacia reevaluación" />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[color:var(--vm-color-ink-muted)]">
            <span>
              Revisión:{" "}
              <b className="text-[color:var(--vm-color-ink)]">
                {plan.reevaluationAt
                  ? formatDate(plan.reevaluationAt)
                  : "Por programar"}
              </b>
            </span>
            <span>{evaluation.readinessScore}/100 en evaluación actual</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function NurturingPlanDetail({
  plan,
  simulation,
  onSave,
  onSimulation,
}: {
  plan: NurturingPlan;
  simulation?: EvaluationResult;
  onSave: (state: NurturingPlan["state"]) => void;
  onSimulation: (result: EvaluationResult) => void;
}) {
  const [note, setNote] = useState("");
  const { lead, state } = plan;

  function toggleMilestone(milestone: string, completed: boolean) {
    const timestamp = new Date().toISOString();
    onSave(
      updateNurturingState(state, {
        type: completed ? "MILESTONE_COMPLETED" : "MILESTONE_REOPENED",
        description: completed
          ? `Avance registrado: ${milestone}.`
          : `Avance reabierto: ${milestone}.`,
        timestamp,
        milestone,
      }),
    );
  }

  function addNote() {
    const cleanNote = note.trim().slice(0, 500);
    if (!cleanNote) return;
    onSave(
      updateNurturingState(state, {
        type: "NOTE_ADDED",
        description: `Nota de acompañamiento: ${cleanNote}`,
        note: cleanNote,
        timestamp: new Date().toISOString(),
      }),
    );
    setNote("");
  }

  function runSimulation() {
    const result = simulateReevaluation(plan);
    onSimulation(result);
    onSave(
      updateNurturingState(state, {
        type: "REEVALUATION_SIMULATED",
        description: `Se simuló una reevaluación: ${result.readinessScore}/100, ruta ${getRouteLabel(result.route)}.`,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  return (
    <aside className="bg-[color:var(--vm-color-canvas)]/55 p-5 sm:p-6 xl:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.13em] text-[color:var(--vm-color-brand-blue)]">
            Plan de acompañamiento
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-.035em]">
            {lead.scenario.displayName}
          </h3>
        </div>
        <Link
          href={`/asesor/leads/${lead.scenario.leadId}`}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[color:var(--vm-color-brand-blue)]/20 bg-white px-3 text-xs font-bold text-[color:var(--vm-color-brand-blue)]"
        >
          Ver perfil <Icon name="arrow" className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <PlanFact
          icon="alert"
          label="Barrera principal"
          value={plan.barrierDescription}
          warning
        />
        <PlanFact
          icon="target"
          label="Objetivo para avanzar"
          value={plan.objective}
        />
        <PlanFact
          icon="heart"
          label="Ruta recomendada"
          value={plan.route}
        />
        <PlanFact
          icon="calendar"
          label="Próxima reevaluación"
          value={
            plan.reevaluationAt
              ? formatDate(plan.reevaluationAt)
              : "Debe programarse manualmente"
          }
        />
      </div>

      {plan.missingData.length ? (
        <div className="mt-4 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-warning)]/20 bg-[#fffaf0] p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[color:var(--vm-color-warning)]">
            <Icon name="info" className="h-4 w-4" /> Datos incompletos
          </div>
          <p className="mt-2 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
            Falta confirmar: {plan.missingData.join(", ")}. El progreso es
            orientativo hasta completar esta información.
          </p>
        </div>
      ) : null}

      <section className="mt-6">
        <h4 className="text-sm font-semibold">Pasos de la ruta</h4>
        <div className="mt-3 space-y-2">
          {plan.milestones.map((milestone) => {
            const completed = state.completedMilestones.includes(milestone);
            return (
              <label
                key={milestone}
                className={`flex min-h-12 items-center gap-3 rounded-[var(--vm-radius-control)] border p-3 text-xs font-semibold transition ${
                  completed
                    ? "border-[color:var(--vm-color-success)]/25 bg-emerald-50"
                    : "border-[color:var(--vm-color-line)] bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(event) =>
                    toggleMilestone(milestone, event.target.checked)
                  }
                  className="h-4 w-4 accent-[color:var(--vm-color-brand-blue)]"
                />
                <span className={completed ? "text-[color:var(--vm-color-success)]" : ""}>
                  {milestone}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon
            name="document"
            className="h-4 w-4 text-[color:var(--vm-color-brand-blue)]"
          />
          Contenidos y beneficios sugeridos
        </div>
        <ul className="mt-3 space-y-2">
          {plan.suggestedResources.map((resource) => (
            <li
              key={resource}
              className="flex gap-2 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]"
            >
              <Icon
                name="check"
                className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--vm-color-success)]"
              />
              {resource}
            </li>
          ))}
        </ul>
        {lead.evaluation.benefitSignals.potential.length ? (
          <div className="mt-4 border-t border-[color:var(--vm-color-line)] pt-4">
            <div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-warning)]">
              Beneficios por validar
            </div>
            <p className="mt-2 text-xs leading-5">
              {lead.evaluation.benefitSignals.potential.join(" · ")}
            </p>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-brand-blue)]/15 bg-[linear-gradient(140deg,#eef8ff,#fffdf0)] p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[color:var(--vm-color-brand-blue)] shadow-sm">
            <Icon name="brain" className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-sm font-semibold">Simular nueva evaluación</h4>
            <p className="mt-1 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
              Proyecta qué ocurriría si se supera la barrera principal. No
              modifica la calificación ni envía el lead al asesor.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={runSimulation}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-4 text-xs font-bold text-white"
        >
          Simular escenario de avance <Icon name="arrow" className="h-4 w-4" />
        </button>
        {simulation ? (
          <div role="status" className="mt-4 grid grid-cols-2 gap-3">
            <SimulationFact
              label="Preparación proyectada"
              value={`${simulation.readinessScore}/100`}
            />
            <SimulationFact
              label="Ruta proyectada"
              value={getRouteLabel(simulation.route)}
            />
          </div>
        ) : null}
      </section>

      <section className="mt-6">
        <label className="text-xs font-semibold">
          Nota de acompañamiento
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            maxLength={500}
            className="mt-2 w-full resize-y rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-white p-3 text-xs leading-5"
            placeholder="Registra avances, acuerdos o información pendiente"
          />
        </label>
        <button
          type="button"
          onClick={addNote}
          disabled={!note.trim()}
          className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[color:var(--vm-color-brand-blue)]/20 bg-white text-xs font-bold text-[color:var(--vm-color-brand-blue)] disabled:opacity-40"
        >
          <Icon name="plus" className="h-4 w-4" /> Guardar nota
        </button>
      </section>

      <section className="mt-6 border-t border-[color:var(--vm-color-line)] pt-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon
            name="history"
            className="h-4 w-4 text-[color:var(--vm-color-brand-blue)]"
          />
          Historial de acompañamiento
        </div>
        <div className="mt-4 max-h-52 space-y-3 overflow-y-auto">
          {state.activities.length ? (
            state.activities.map((activity) => (
              <div
                key={activity.id}
                className="border-l-2 border-[color:var(--vm-color-brand-blue)]/20 pl-3"
              >
                <p className="text-xs leading-5">{activity.description}</p>
                <time className="text-[9px] text-[color:var(--vm-color-ink-muted)]">
                  {formatDateTime(activity.occurredAt)}
                </time>
              </div>
            ))
          ) : (
            <p className="text-xs text-[color:var(--vm-color-ink-muted)]">
              Aún no hay acciones de acompañamiento registradas.
            </p>
          )}
        </div>
      </section>
    </aside>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
  accent = false,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <article
      className={`rounded-[var(--vm-radius-card)] border p-5 shadow-[var(--vm-shadow-low)] ${
        accent
          ? "border-[color:var(--vm-color-brand-blue)] bg-[color:var(--vm-color-brand-blue)] text-white"
          : "border-[color:var(--vm-color-line)] bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={`text-[10px] font-bold uppercase tracking-[.1em] ${
            accent
              ? "text-white/75"
              : "text-[color:var(--vm-color-ink-muted)]"
          }`}
        >
          {label}
        </div>
        <Icon name={icon} className="h-4 w-4" />
      </div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
      <div
        className={`mt-1 text-xs ${
          accent
            ? "text-white/75"
            : "text-[color:var(--vm-color-ink-muted)]"
        }`}
      >
        {detail}
      </div>
    </article>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-bold transition ${
        active
          ? "bg-[color:var(--vm-color-brand-blue)] text-white"
          : "border border-[color:var(--vm-color-line)] bg-white text-[color:var(--vm-color-ink-muted)] hover:border-[color:var(--vm-color-brand-blue)]"
      }`}
    >
      {children}
    </button>
  );
}

function PlanFact({
  icon,
  label,
  value,
  warning = false,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--vm-radius-control)] border p-4 ${
        warning
          ? "border-[color:var(--vm-color-warning)]/20 bg-[#fffaf0]"
          : "border-[color:var(--vm-color-line)] bg-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon
          name={icon}
          className={`h-4 w-4 ${
            warning
              ? "text-[color:var(--vm-color-warning)]"
              : "text-[color:var(--vm-color-brand-blue)]"
          }`}
        />
        <div className="text-[9px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-ink-muted)]">
          {label}
        </div>
      </div>
      <p className="mt-2 text-xs font-semibold leading-5">{value}</p>
    </div>
  );
}

function SimulationFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--vm-radius-control)] bg-white p-3">
      <div className="text-[9px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-ink-muted)]">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function NurturingLoading() {
  return (
    <section
      aria-live="polite"
      aria-busy="true"
      className="surface-solid p-8"
    >
      <div className="h-3 w-32 animate-pulse rounded-full bg-[color:var(--vm-color-brand-blue)]/10" />
      <div className="mt-4 h-8 w-72 max-w-full animate-pulse rounded-full bg-[color:var(--vm-color-brand-blue)]/10" />
      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        <div className="h-44 animate-pulse rounded-[var(--vm-radius-card)] bg-[color:var(--vm-color-brand-blue)]/[.04]" />
        <div className="h-44 animate-pulse rounded-[var(--vm-radius-card)] bg-[color:var(--vm-color-brand-blue)]/[.04]" />
      </div>
      <span className="sr-only">Cargando planes de acompañamiento</span>
    </section>
  );
}

function NurturingError({ onRetry }: { onRetry: () => void }) {
  return (
    <section role="alert" className="surface-solid p-9 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-700">
        <Icon name="alert" />
      </span>
      <h2 className="mt-4 text-xl font-semibold">
        No pudimos cargar el acompañamiento local.
      </h2>
      <p className="mt-2 text-sm text-[color:var(--vm-color-ink-muted)]">
        Los resultados calculados no se modificaron. Intenta leer nuevamente el
        estado guardado en este dispositivo.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 min-h-11 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white"
      >
        Intentar de nuevo
      </button>
    </section>
  );
}

function NurturingEmpty({ filtered }: { filtered: boolean }) {
  return (
    <section className="p-10 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]">
        <Icon name="check" />
      </span>
      <h2 className="mt-4 text-xl font-semibold">
        {filtered
          ? "No hay prospectos con esta barrera."
          : "No hay prospectos en acompañamiento."}
      </h2>
      <p className="mt-2 text-sm text-[color:var(--vm-color-ink-muted)]">
        {filtered
          ? "Selecciona otra categoría para revisar la cola."
          : "Las nuevas rutas de preparación aparecerán aquí después de la evaluación."}
      </p>
    </section>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getRouteLabel(route: EvaluationResult["route"]): string {
  const labels: Record<EvaluationResult["route"], string> = {
    ADVISOR_NOW: "Atención comercial",
    NON_AFFILIATE_PRIORITY: "Atención comercial",
    NURTURE_FINANCIAL: "Acompañamiento financiero",
    NURTURE_BENEFITS: "Validación de beneficios",
    NURTURE_LONG_TERM: "Preparación a largo plazo",
    NEEDS_DATA: "Completar información",
    OPTED_OUT: "Sin contacto",
  };
  return labels[route];
}
