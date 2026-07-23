"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import type { EvaluationResult } from "@/features/conversation/domain";
import { isCommercialOpportunity } from "@/features/conversation/qualified-leads";
import { useCommercialStates } from "../use-commercial-states";

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
  const title = !commercial
    ? evaluation.nextAction
    : !state?.assignedTo
      ? "Tomar la oportunidad"
      : !state.firstContactAt
        ? "Registrar el primer contacto"
        : state.status === "CONTACTING"
          ? "Registrar el resultado"
          : !state.followUpAt
            ? "Programar el siguiente paso"
          : "Cumplir el seguimiento programado";
  const description = !commercial
    ? evaluation.blockers[0] ?? "Continuar la ruta de acompañamiento."
    : !state?.assignedTo
      ? "La gestión permanece bloqueada hasta que un asesor acepte la oportunidad."
      : !state.firstContactAt
        ? "Después del contacto podrás registrar el resultado y la siguiente actividad."
        : state.status === "CONTACTING"
          ? "Define cómo resultó el contacto para habilitar el siguiente paso."
          : state.followUpAt
            ? `Seguimiento programado para ${formatDate(state.followUpAt)}.`
            : "El resultado ya está registrado; define cuándo debe continuar la gestión.";

  if (compact) {
    return (
      <section className="sticky top-[72px] z-20 flex flex-col gap-3 rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-brand-blue)]/20 bg-white/95 p-3.5 shadow-[0_10px_30px_rgba(17,24,32,.09)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]">
            <Icon name="target" className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-[9px] font-bold uppercase tracking-[.12em] text-[color:var(--vm-color-brand-blue)]">
              Siguiente acción
            </div>
            <p className="truncate text-sm font-semibold">{title}</p>
          </div>
        </div>
        {commercial && !state?.followUpAt ? (
          <button
            type="button"
            onClick={onManage}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-4 text-xs font-bold text-white"
          >
            Gestionar ahora <Icon name="arrow" className="h-3.5 w-3.5" />
          </button>
        ) : (
          <Link
            href={commercial ? "/asesor/agenda" : "/asesor/nutricion"}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-4 text-xs font-bold text-white"
          >
            {commercial ? "Ver actividad" : "Abrir acompañamiento"}
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
