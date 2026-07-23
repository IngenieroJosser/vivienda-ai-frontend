"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import type { EvaluationResult } from "@/features/conversation/domain";
import { isCommercialOpportunity } from "@/features/conversation/qualified-leads";
import { useCommercialStates } from "../use-commercial-states";
import { getCommercialWorkflow } from "../workflow";

export function CommercialNextStep({
  leadId,
  evaluation,
  compact = false,
  onManage,
}: {
  leadId: string;
  evaluation: EvaluationResult;
  compact?: boolean;
  onManage?: () => void;
}) {
  const { states } = useCommercialStates();
  const state = states[leadId];
  const commercial = isCommercialOpportunity(evaluation);
  const workflow = getCommercialWorkflow(state);
  const title = commercial ? workflow.title : evaluation.nextAction;
  const description = commercial
    ? workflow.description
    : evaluation.blockers[0] ?? "Continuar la ruta de acompañamiento.";

  if (compact) {
    return (
      <section className="advisor-action-dock sticky top-[72px] z-20">
        <div className="advisor-action-dock__summary">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]">
            <Icon name="target" className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-[9px] font-bold uppercase tracking-[.12em] text-[color:var(--vm-color-brand-blue)]">
              Qué debes hacer ahora
            </div>
            <p className="text-sm font-semibold">{title}</p>
            <span>{description}</span>
          </div>
        </div>
        {commercial ? (
          <WorkflowProgress completed={workflow.completedSteps} />
        ) : null}
        {commercial && workflow.action !== "FOLLOW_UP" ? (
          <button
            type="button"
            onClick={onManage}
            className="advisor-action-dock__button"
          >
            {workflow.ctaLabel} <Icon name="arrow" className="h-3.5 w-3.5" />
          </button>
        ) : (
          <Link
            href={commercial ? "/asesor/agenda" : "/asesor/nutricion"}
            className="advisor-action-dock__button"
          >
            {commercial ? workflow.ctaLabel : "Abrir acompañamiento"}
            <Icon name="arrow" className="h-3.5 w-3.5" />
          </Link>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-[var(--vm-radius-elevated)] border border-[color:var(--vm-color-brand-blue)]/20 bg-[linear-gradient(145deg,#eef8ff,#fffdf0)] p-6 shadow-[var(--vm-shadow-medium)]">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-[.14em] text-[color:var(--vm-color-brand-blue)]">Siguiente acción sugerida</div>
        <Icon name="target" className="h-5 w-5 text-[color:var(--vm-color-brand-blue)]" />
      </div>
      <h3 className="mt-5 text-2xl font-semibold tracking-[-.04em]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{description}</p>
      {!commercial ? (
        <Link href="/asesor/nutricion" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white">
          Abrir acompañamiento <Icon name="heart" className="h-4 w-4" />
        </Link>
      ) : state?.followUpAt ? (
        <Link href="/asesor/agenda" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white">
          Ver en agenda <Icon name="calendar" className="h-4 w-4" />
        </Link>
      ) : (
        <div className="mt-6 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-brand-blue)]/15 bg-white/75 p-3 text-center text-xs font-semibold text-[color:var(--vm-color-brand-blue)]">
          Completa esta acción en Gestión comercial
        </div>
      )}
    </section>
  );
}

function WorkflowProgress({ completed }: { completed: number }) {
  const steps = ["Asignar", "Contactar", "Resultado", "Seguimiento"];
  return (
    <ol className="advisor-action-dock__progress" aria-label="Progreso comercial">
      {steps.map((step, index) => (
        <li
          key={step}
          className={index < completed ? "advisor-action-dock__step--done" : ""}
        >
          <span>{index < completed ? <Icon name="check" className="h-3 w-3" /> : index + 1}</span>
          <small>{step}</small>
        </li>
      ))}
    </ol>
  );
}
