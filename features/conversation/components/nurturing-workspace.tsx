"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { isNurturingLead } from "../qualified-leads";
import { useQualifiedLeads } from "./use-qualified-leads";

const routeLabels = {
  NURTURE_FINANCIAL: "Financiera",
  NURTURE_BENEFITS: "Beneficios",
  NURTURE_LONG_TERM: "Largo plazo",
  NEEDS_DATA: "Información",
} as const;

export function NurturingWorkspace() {
  const qualifiedLeads = useQualifiedLeads();
  const [filter, setFilter] = useState("Todas");
  const nurturing = useMemo(
    () => qualifiedLeads.filter(({ evaluation }) => isNurturingLead(evaluation)),
    [qualifiedLeads],
  );
  const filtered = filter === "Todas"
    ? nurturing
    : nurturing.filter(({ evaluation }) => routeLabels[evaluation.route as keyof typeof routeLabels] === filter);

  return (
    <div className="space-y-6">
      <section className="surface-solid p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-warning)]">Cola de maduración</div>
            <h2 className="mt-2 text-2xl font-semibold">Acompañar antes de vender.</h2>
            <p className="mt-2 text-sm text-[color:var(--vm-color-ink-muted)]">Cada lead conserva un bloqueo, una acción, una fecha y una condición verificable para avanzar.</p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Filtrar nutrición">
            {["Todas", "Financiera", "Beneficios", "Largo plazo", "Información"].map((item) => (
              <button key={item} type="button" onClick={() => setFilter(item)} aria-pressed={filter === item} className={`min-h-11 rounded-full px-4 text-xs font-bold transition ${filter === item ? "bg-[color:var(--vm-color-brand-blue)] text-white" : "border border-[color:var(--vm-color-line)] bg-white text-[color:var(--vm-color-ink-muted)] hover:border-[color:var(--vm-color-brand-blue)]"}`}>{item}</button>
            ))}
          </div>
        </div>
      </section>

      {filtered.length ? (
        <div className="grid gap-5">
          {filtered.map(({ scenario, evaluation }) => (
            <article key={scenario.leadId} className="surface-solid overflow-hidden">
              <div className="grid gap-5 p-6 lg:grid-cols-[.8fr_1fr_1fr_auto] lg:items-start">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--vm-color-brand-yellow)]/25 font-bold text-[color:var(--vm-color-warning)]">{scenario.displayName.slice(0, 2).toUpperCase()}</span>
                  <div><h3 className="font-bold">{scenario.displayName}</h3><div className="mt-1"><Pill tone="yellow">{routeLabels[evaluation.route as keyof typeof routeLabels]}</Pill></div></div>
                </div>
                <NurtureField icon="alert" label="Bloqueo principal" value={evaluation.blockers[0] ?? "Información insuficiente"} />
                <NurtureField icon="target" label="Acción recomendada" value={evaluation.nextAction} />
                <Link href={`/asesor/leads/${scenario.leadId}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[color:var(--vm-color-brand-blue)]/20 px-4 text-xs font-bold text-[color:var(--vm-color-brand-blue)]">Ver perfil <Icon name="arrow" className="h-4 w-4" /></Link>
              </div>
              <div className="grid gap-4 border-t border-[color:var(--vm-color-line)] bg-[color:var(--vm-color-brand-blue)]/[.025] px-6 py-5 sm:grid-cols-2">
                <NurtureField icon="calendar" label="Fecha de seguimiento" value={evaluation.followUpAt ? formatFollowUpDate(evaluation.followUpAt) : "Sin seguimiento automático"} />
                <NurtureField icon="check" label="Condición para avanzar" value={evaluation.advanceCondition} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="surface-solid p-9 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]"><Icon name="check" /></span>
          <h2 className="mt-4 text-xl font-semibold">No hay leads en esta ruta.</h2>
          <p className="mt-2 text-sm text-[color:var(--vm-color-ink-muted)]">Prueba otro filtro para revisar la cola de nutrición.</p>
        </section>
      )}
    </div>
  );
}

function NurtureField({ icon, label, value }: { icon: Parameters<typeof Icon>[0]["name"]; label: string; value: string }) {
  return <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-white text-[color:var(--vm-color-brand-blue)] shadow-sm"><Icon name={icon} className="h-4 w-4" /></span><div><div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-1.5 text-sm font-semibold leading-5">{value}</div></div></div>;
}

function formatFollowUpDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}
