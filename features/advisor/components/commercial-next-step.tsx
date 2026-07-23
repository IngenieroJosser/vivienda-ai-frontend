"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import type { EvaluationResult } from "@/features/conversation/domain";
import { isCommercialOpportunity } from "@/features/conversation/qualified-leads";
import { useCommercialStates } from "../use-commercial-states";

export function CommercialNextStep({
  leadId,
  evaluation,
}: {
  leadId: string;
  evaluation: EvaluationResult;
}) {
  const { states } = useCommercialStates();
  const state = states[leadId];
  const commercial = isCommercialOpportunity(evaluation);
  const title = !commercial
    ? evaluation.nextAction
    : !state?.assignedTo
      ? "Tomar la oportunidad"
      : !state.firstContactAt
        ? "Registrar el primer contacto"
        : !state.followUpAt
          ? "Definir el resultado y programar seguimiento"
          : "Cumplir el seguimiento programado";
  const description = !commercial
    ? evaluation.blockers[0] ?? "Continuar la ruta de acompañamiento."
    : !state?.assignedTo
      ? "La gestión permanece bloqueada hasta que un asesor acepte la oportunidad."
      : !state.firstContactAt
        ? "Después del contacto podrás registrar el resultado y la siguiente actividad."
        : state.followUpAt
          ? `Seguimiento programado para ${formatDate(state.followUpAt)}.`
          : "Registra el resultado del contacto antes de definir el siguiente paso.";

  return (
    <section className="rounded-[var(--vm-radius-elevated)] border border-[color:var(--vm-color-brand-blue)]/20 bg-[linear-gradient(145deg,#eef8ff,#fffdf0)] p-6 shadow-[var(--vm-shadow-medium)]">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-[.14em] text-[color:var(--vm-color-brand-blue)]">Próxima mejor acción</div>
        <Icon name="sparkles" className="h-5 w-5 text-[color:var(--vm-color-brand-blue)]" />
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
