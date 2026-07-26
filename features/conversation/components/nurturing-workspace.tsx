"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FeedbackState } from "@/components/feedback-state";
import { Icon } from "@/components/icon";
import { Pill, ProgressBar } from "@/components/ui";
import {
  barrierLabels,
  buildNurturingPlans,
  updateNurturingState,
  type NurturingBarrier,
  type NurturingPlan,
} from "@/features/nurturing/domain";
import { useNurturingStates } from "@/features/nurturing/use-nurturing-states";
import { useQualifiedLeads } from "./use-qualified-leads";

type Filter = "ALL" | "EXCEPTIONS" | NurturingBarrier;

export function NurturingWorkspace() {
  const qualifiedLeads = useQualifiedLeads();
  const { states, status, save, retry } = useNurturingStates();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [selectedLeadId, setSelectedLeadId] = useState<string>();
  const [currentTime, setCurrentTime] = useState(0);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setCurrentTime(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const plans = useMemo(
    () => buildNurturingPlans(qualifiedLeads, states),
    [qualifiedLeads, states],
  );
  const filtered = useMemo(() => {
    if (filter === "ALL") return plans;
    if (filter === "EXCEPTIONS") {
      return plans.filter(({ interventionRequired }) => interventionRequired);
    }
    return plans.filter(({ barrier }) => barrier === filter);
  }, [filter, plans]);
  const selectedPlan =
    filtered.find(({ lead }) => lead.scenario.leadId === selectedLeadId) ??
    filtered[0];
  const dueSoon = plans.filter(({ reevaluationAt }) => {
    if (!reevaluationAt || !currentTime) return false;
    const days =
      (new Date(reevaluationAt).getTime() - currentTime) / 86_400_000;
    return days <= 30;
  }).length;
  const exceptions = plans.filter(
    ({ interventionRequired }) => interventionRequired,
  ).length;
  const active = plans.filter(
    ({ state }) => state.journeyStatus === "ACTIVE",
  ).length;
  const readyToReview = plans.filter(({ progress }) => progress >= 80).length;

  function selectPlan(leadId: string) {
    setSelectedLeadId(leadId);
    if (window.matchMedia("(max-width: 1279px)").matches) {
      window.requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({ block: "start" });
      });
    }
  }

  if (status === "LOADING") return <NurturingLoading />;
  if (status === "ERROR") return <NurturingError onRetry={retry} />;

  return (
    <div className="space-y-4">
      <section
        className="surface-solid grid divide-y divide-[color:var(--vm-color-line)] overflow-hidden sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4"
        aria-label="Estado del acompañamiento"
      >
        <CompactMetric label="Rutas activas" value={active} icon="heart" />
        <CompactMetric
          label="Intervención requerida"
          value={exceptions}
          icon="alert"
          warning={exceptions > 0}
        />
        <CompactMetric
          label="Reevaluación próxima"
          value={dueSoon}
          icon="calendar"
        />
        <CompactMetric
          label="Listos para revisar"
          value={readyToReview}
          icon="target"
        />
      </section>

      <section className="surface-solid">
        <div className="border-b border-[color:var(--vm-color-line)] p-5">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
                Supervisión de rutas
              </div>
              <h2 className="mt-1 text-xl font-semibold tracking-[-.03em]">
                Acompañamiento automático y excepciones
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
                El sistema propone la ruta, los contenidos y la reevaluación.
                El equipo interviene únicamente cuando existe un bloqueo o una
                excepción.
              </p>
            </div>
            <div
              className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible"
              aria-label="Filtrar acompañamiento"
            >
              <FilterButton active={filter === "ALL"} onClick={() => setFilter("ALL")}>
                Todos
              </FilterButton>
              <FilterButton
                active={filter === "EXCEPTIONS"}
                onClick={() => setFilter("EXCEPTIONS")}
              >
                Excepciones {exceptions ? `· ${exceptions}` : ""}
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

          <div className="mt-4 flex items-start gap-3 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-brand-blue)]/15 bg-[color:var(--vm-color-brand-blue)]/[.035] p-3 text-xs leading-5">
            <Icon
              name="info"
              className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--vm-color-brand-blue)]"
            />
            <p>
              Las rutas, hitos, fechas y excepciones de los leads capturados se
              sincronizan con el backend. Los escenarios de demostración conservan
              su estado en este navegador.
            </p>
          </div>
        </div>

        {filtered.length ? (
          <div className="grid xl:grid-cols-[minmax(290px,32fr)_minmax(0,68fr)]">
            <div className="h-fit divide-y divide-[color:var(--vm-color-line)] border-b border-[color:var(--vm-color-line)] xl:sticky xl:top-[72px] xl:max-h-[calc(100vh-88px)] xl:overflow-y-auto xl:border-b-0 xl:border-r">
              {filtered.map((plan) => (
                <NurturingLeadRow
                  key={plan.lead.scenario.leadId}
                  plan={plan}
                  selected={
                    selectedPlan?.lead.scenario.leadId ===
                    plan.lead.scenario.leadId
                  }
                  onSelect={() => selectPlan(plan.lead.scenario.leadId)}
                />
              ))}
            </div>
            {selectedPlan ? (
              <div
                ref={detailRef}
                key={selectedPlan.lead.scenario.leadId}
                className="advisor-detail-enter min-w-0 scroll-mt-20"
              >
                <NurturingPlanDetail plan={selectedPlan} onSave={save} />
              </div>
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
  const { scenario } = plan.lead;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full p-4 text-left transition ${
        selected
          ? "bg-[color:var(--vm-color-brand-blue)]/[.06] shadow-[var(--vm-shadow-inset-active)]"
          : "bg-white hover:bg-[color:var(--vm-color-brand-blue)]/[.025]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold">
              {scenario.displayName}
            </h3>
            {plan.interventionRequired ? (
              <span
                aria-label="Intervención humana requerida"
                className="h-2 w-2 shrink-0 rounded-full bg-[color:var(--vm-color-error)]"
              />
            ) : null}
          </div>
          <p className="mt-1 truncate text-[11px] text-[color:var(--vm-color-ink-muted)]">
            {plan.route}
          </p>
        </div>
        <Pill tone={plan.interventionRequired ? "red" : "blue"}>
          {plan.statusLabel}
        </Pill>
      </div>
      <div className="mt-3">
        <ProgressBar value={plan.progress} label="Progreso verificable" />
      </div>
      <dl className="mt-3 grid gap-2 text-[11px]">
        <div>
          <dt className="text-[color:var(--vm-color-ink-muted)]">Barrera</dt>
          <dd className="mt-0.5 font-semibold">{plan.barrierLabel}</dd>
        </div>
        <div>
          <dt className="text-[color:var(--vm-color-ink-muted)]">
            Próxima acción automática
          </dt>
          <dd className="mt-0.5 line-clamp-2 font-semibold">
            {plan.nextAutomaticAction}
          </dd>
        </div>
      </dl>
    </button>
  );
}

function NurturingPlanDetail({
  plan,
  onSave,
}: {
  plan: NurturingPlan;
  onSave: (state: NurturingPlan["state"]) => void;
}) {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const { lead, state } = plan;
  const paused = state.journeyStatus === "PAUSED";

  function persistException(
    action: "TOGGLE" | "REEVALUATE" | "ESCALATE",
  ) {
    const cleanReason = reason.trim().slice(0, 500);
    if (!cleanReason) {
      setFeedback("Registra un motivo antes de realizar una intervención.");
      return;
    }
    const timestamp = new Date().toISOString();
    const input: Omit<
      Parameters<typeof updateNurturingState>[1],
      "timestamp"
    > =
      action === "TOGGLE"
        ? {
            type: paused ? "JOURNEY_RESUMED" : "JOURNEY_PAUSED",
            description: `${paused ? "Ruta reanudada" : "Ruta pausada"}. Motivo: ${cleanReason}`,
            journeyStatus: paused ? "ACTIVE" : "PAUSED",
            interventionRequired: false,
          }
        : action === "REEVALUATE"
          ? {
              type: "REEVALUATION_REQUESTED",
              description: `Reevaluación solicitada. Motivo: ${cleanReason}`,
              journeyStatus: "REEVALUATION_PENDING",
              interventionRequired: false,
              requestedReevaluationAt: timestamp,
            }
          : {
              type: "CASE_ESCALATED",
              description: `Caso escalado a intervención humana. Motivo: ${cleanReason}`,
              journeyStatus: "NEEDS_ATTENTION",
              interventionRequired: true,
            };

    onSave(
      updateNurturingState(state, {
        ...input,
        timestamp,
      }),
    );
    setReason("");
    setFeedback(
      lead.source === "BACKEND"
        ? "Intervención enviada al backend y añadida al historial."
        : "Intervención guardada en el escenario de demostración.",
    );
  }

  return (
    <aside className="bg-[color:var(--vm-color-canvas)]/45 p-5 sm:p-6 xl:p-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
              Ruta supervisada
            </div>
            {plan.interventionRequired ? (
              <Pill tone="red">Intervención requerida</Pill>
            ) : null}
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-.035em]">
            {lead.scenario.displayName}
          </h3>
          <p className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">
            {plan.statusLabel}
          </p>
        </div>
        <Link
          href={`/asesor/leads/${lead.scenario.leadId}`}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[color:var(--vm-color-brand-blue)]/20 bg-white px-3 text-xs font-bold text-[color:var(--vm-color-brand-blue)]"
        >
          Consultar perfil <Icon name="arrow" className="h-3.5 w-3.5" />
        </Link>
      </div>

      <section className="mt-5 grid gap-3 sm:grid-cols-2">
        <PlanFact
          icon="alert"
          label="Barrera principal"
          value={plan.barrierDescription}
          warning
        />
        <PlanFact
          icon="target"
          label="Condición para avanzar"
          value={plan.objective}
        />
        <PlanFact icon="heart" label="Ruta de preparación" value={plan.route} />
        <PlanFact
          icon="clock"
          label="Última interacción"
          value={formatDateTime(plan.lastInteractionAt)}
        />
        <PlanFact
          icon="calendar"
          label="Próxima reevaluación"
          value={
            plan.reevaluationAt
              ? formatDate(plan.reevaluationAt)
              : "Reevaluación por programar"
          }
        />
      </section>

      <section className="mt-5 rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-brand-blue)]/15 bg-white p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]">
            <Icon name="arrow" className="h-4 w-4" />
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">
              Próxima acción automática
            </div>
            <p className="mt-1 text-sm font-semibold">
              {plan.nextAutomaticAction}
            </p>
          </div>
        </div>
      </section>

      {plan.missingData.length ? (
        <div className="surface-warning-soft mt-5 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-warning)]/20 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[color:var(--vm-color-warning)]">
            <Icon name="info" className="h-4 w-4" /> Motivo de bloqueo
          </div>
          <p className="mt-2 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
            Falta confirmar: {plan.missingData.join(", ")}.
          </p>
        </div>
      ) : null}

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold">Progreso de la ruta</h4>
          <Pill tone="gray">Actualización automática</Pill>
        </div>
        <ol className="mt-3 space-y-2">
          {plan.milestones.map((milestone, index) => {
            const completed = state.completedMilestones.includes(milestone);
            const current =
              !completed &&
              index === state.completedMilestones.length &&
              state.journeyStatus === "ACTIVE";
            return (
              <li
                key={milestone}
                className={`flex min-h-12 items-center gap-3 rounded-[var(--vm-radius-control)] border p-3 text-xs ${
                  completed
                    ? "border-[color:var(--vm-color-success)]/25 bg-[color:var(--vm-color-success-soft)]"
                    : current
                      ? "border-[color:var(--vm-color-brand-blue)]/20 bg-white"
                      : "border-[color:var(--vm-color-line)] bg-white/65"
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                    completed
                      ? "bg-[color:var(--vm-color-success)] text-white"
                      : current
                        ? "bg-[color:var(--vm-color-brand-blue)] text-white"
                        : "bg-[color:var(--vm-color-line)] text-[color:var(--vm-color-ink-muted)]"
                  }`}
                >
                  {completed ? <Icon name="check" className="h-3 w-3" /> : index + 1}
                </span>
                <span className="font-semibold">{milestone}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-6 rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon
            name="document"
            className="h-4 w-4 text-[color:var(--vm-color-brand-blue)]"
          />
          Contenidos programados por la ruta
        </div>
        <ul className="mt-3 space-y-2">
          {plan.suggestedResources.map((resource) => (
            <li
              key={resource}
              className="flex gap-2 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]"
            >
              <Icon
                name="clock"
                className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--vm-color-brand-blue)]"
              />
              {resource}
            </li>
          ))}
        </ul>
      </section>

      <section className="surface-warning-soft mt-6 rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-warning)]/20 p-5">
        <div className="flex items-start gap-3">
          <Icon
            name="shield"
            className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--vm-color-warning)]"
          />
          <div>
            <h4 className="text-sm font-semibold">Intervención excepcional</h4>
            <p className="mt-1 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
              {lead.source === "BACKEND"
                ? "Toda intervención requiere motivo, queda registrada y sincroniza el estado de la ruta con el backend."
                : "Toda intervención requiere motivo y queda registrada en este escenario de demostración."}
            </p>
          </div>
        </div>
        <label className="mt-4 block text-xs font-semibold">
          Motivo de la intervención
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            maxLength={500}
            className="mt-2 w-full resize-y rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-white p-3 text-xs leading-5"
            placeholder="Explica el bloqueo, la corrección o la razón de la excepción"
          />
        </label>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <ExceptionButton
            icon={paused ? "arrow" : "clock"}
            label={paused ? "Reanudar ruta" : "Pausar ruta"}
            onClick={() => persistException("TOGGLE")}
          />
          <ExceptionButton
            icon="target"
            label="Solicitar reevaluación"
            onClick={() => persistException("REEVALUATE")}
          />
          <ExceptionButton
            icon="user"
            label="Escalar caso"
            onClick={() => persistException("ESCALATE")}
          />
        </div>
        {feedback ? (
          <p
            role="status"
            className="advisor-toast mt-3 rounded-[var(--vm-radius-control)] bg-white p-3 text-xs"
          >
            {feedback}
          </p>
        ) : null}
      </section>

      <section className="mt-6 border-t border-[color:var(--vm-color-line)] pt-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon
            name="history"
            className="h-4 w-4 text-[color:var(--vm-color-brand-blue)]"
          />
          Historial del acompañamiento
        </div>
        <div className="mt-4 max-h-52 space-y-3 overflow-y-auto">
          {state.activities.length ? (
            state.activities.map((activity) => (
              <div
                key={activity.id}
                className="border-l-2 border-[color:var(--vm-color-brand-blue)]/20 pl-3"
              >
                <p className="text-xs leading-5">{activity.description}</p>
                <time className="text-[11px] text-[color:var(--vm-color-ink-muted)]">
                  {formatDateTime(activity.occurredAt)}
                </time>
              </div>
            ))
          ) : (
            <p className="text-xs text-[color:var(--vm-color-ink-muted)]">
              Sin excepciones registradas. La ruta continúa automáticamente.
            </p>
          )}
        </div>
      </section>
    </aside>
  );
}

function CompactMetric({
  label,
  value,
  icon,
  warning = false,
}: {
  label: string;
  value: number;
  icon: Parameters<typeof Icon>[0]["name"];
  warning?: boolean;
}) {
  return (
    <article className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div>
        <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">
          {label}
        </div>
        <div className={`mt-1 text-2xl font-semibold ${warning ? "text-[color:var(--vm-color-error)]" : ""}`}>
          {value}
        </div>
      </div>
      <Icon
        name={icon}
        className={`h-4 w-4 ${warning ? "text-[color:var(--vm-color-error)]" : "text-[color:var(--vm-color-brand-blue)]"}`}
      />
    </article>
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
    <div className="rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-white p-4">
      <div className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.08em] ${warning ? "text-[color:var(--vm-color-warning)]" : "text-[color:var(--vm-color-ink-muted)]"}`}>
        <Icon name={icon} className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-xs font-semibold leading-5">{value}</p>
    </div>
  );
}

function ExceptionButton({
  icon,
  label,
  onClick,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[color:var(--vm-color-warning)]/25 bg-white px-3 text-xs font-bold"
    >
      <Icon name={icon} className="h-4 w-4" />
      {label}
    </button>
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
      className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-bold transition ${
        active
          ? "bg-[color:var(--vm-color-brand-blue)] text-white"
          : "border border-[color:var(--vm-color-line)] bg-white text-[color:var(--vm-color-ink-muted)] hover:border-[color:var(--vm-color-brand-blue)]/30 hover:text-[color:var(--vm-color-brand-blue)]"
      }`}
    >
      {children}
    </button>
  );
}

function NurturingEmpty({ filtered }: { filtered: boolean }) {
  return (
    <FeedbackState
      title={
        filtered
          ? "No hay rutas con este filtro"
          : "No hay prospectos en acompañamiento"
      }
      description={
        filtered
          ? "Prueba otro criterio para consultar las rutas activas."
          : "Las nuevas rutas aparecerán cuando una evaluación determine que el prospecto necesita preparación."
      }
      icon={filtered ? "filter" : "check"}
      tone={filtered ? "neutral" : "success"}
      variant="embedded"
      headingLevel={3}
    />
  );
}

function NurturingLoading() {
  return (
    <div aria-busy="true" className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-[var(--vm-radius-card)] bg-white"
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[32fr_68fr]">
        <div className="h-96 animate-pulse rounded-[var(--vm-radius-card)] bg-white" />
        <div className="h-[620px] animate-pulse rounded-[var(--vm-radius-card)] bg-white" />
      </div>
    </div>
  );
}

function NurturingError({ onRetry }: { onRetry: () => void }) {
  return (
    <FeedbackState
      title="No pudimos cargar el acompañamiento local"
      description="Las evaluaciones originales permanecen intactas."
      icon="alert"
      tone="error"
      action={{ label: "Intentar nuevamente", onClick: onRetry }}
    />
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
