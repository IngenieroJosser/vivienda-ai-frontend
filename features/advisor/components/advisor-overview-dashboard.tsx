"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { isNurturingLead } from "@/features/conversation/qualified-leads";
import { useQualifiedLeads } from "@/features/conversation/components/use-qualified-leads";
import { AdvisorDataIntelligence } from "./advisor-data-intelligence";
import { CommercialDashboard } from "./commercial-dashboard";
import { LeadDetailClient } from "./lead-detail-client";

export function AdvisorOverviewDashboard({
  focusLeadId,
  receivedFromChat = false,
}: {
  readonly focusLeadId?: string;
  readonly receivedFromChat?: boolean;
}) {
  const qualifiedLeads = useQualifiedLeads();
  const accompaniment = qualifiedLeads
    .filter(
      (lead) =>
        lead.source === "BACKEND" && isNurturingLead(lead.evaluation),
    )
    .sort(
      (left, right) =>
        Number(right.backendNurture?.interventionRequired ?? false) -
          Number(left.backendNurture?.interventionRequired ?? false) ||
        right.evaluation.readinessScore - left.evaluation.readinessScore,
    )
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {focusLeadId ? (
        <section className="space-y-4">
          <div className="surface-solid flex flex-col justify-between gap-4 border-l-4 border-l-[color:var(--vm-color-success)] px-5 py-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-success-soft)] text-[color:var(--vm-color-success)]">
                <Icon name="check" className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold">
                  {receivedFromChat
                    ? "Recorrido recibido desde orientación"
                    : "Oportunidad seleccionada"}
                </h2>
                <p className="mt-1 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
                  El perfil, la conversación, las recomendaciones y el siguiente
                  paso están disponibles sin repetir preguntas al prospecto.
                </p>
              </div>
            </div>
            <Link
              href="/asesor/leads"
              className="inline-flex min-h-10 items-center gap-2 text-xs font-bold text-[color:var(--vm-color-brand-blue)]"
            >
              Ver bandeja completa
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
          <LeadDetailClient leadId={focusLeadId} embedded />
        </section>
      ) : null}

      <AdvisorDataIntelligence />

      <section className="surface-solid overflow-hidden">
        <header className="flex flex-col justify-between gap-3 border-b border-[color:var(--vm-color-line)] px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-[11px] font-bold uppercase text-[color:var(--vm-color-brand-blue)]">
              Propósito social
            </div>
            <h2 className="mt-1 text-lg font-semibold">
              Personas que necesitan acompañamiento
            </h2>
            <p className="mt-1 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
              Casos reales del backend que todavía no deben pasar a cierre.
            </p>
          </div>
          <Link
            href="/asesor/nutricion"
            className="inline-flex min-h-10 items-center gap-2 text-xs font-bold text-[color:var(--vm-color-brand-blue)]"
          >
            Gestionar rutas
            <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </header>

        {accompaniment.length ? (
          <div className="divide-y divide-[color:var(--vm-color-line)]">
            {accompaniment.map((lead) => {
              const nurture = lead.backendNurture;
              const completed =
                nurture?.milestones.filter(({ completed }) => completed)
                  .length ?? 0;
              const total = nurture?.milestones.length ?? 0;
              return (
                <article
                  key={lead.scenario.leadId}
                  className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(180px,.8fr)_minmax(220px,1fr)_minmax(220px,1.2fr)_auto] lg:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold">
                        {lead.scenario.displayName}
                      </h3>
                      {nurture?.interventionRequired ? (
                        <Pill tone="yellow">Requiere intervención</Pill>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[11px] text-[color:var(--vm-color-ink-muted)]">
                      {profileLabel(
                        lead.evaluation.profileSnapshot.affiliation,
                      )}{" "}
                      · {lead.scenario.leadSource === "META" ? "Pauta" : "Propio"}
                    </p>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase text-[color:var(--vm-color-ink-muted)]">
                      Brecha principal
                    </div>
                    <div className="mt-1 text-xs font-semibold">
                      {nurture?.primaryGap ??
                        lead.evaluation.blockers[0] ??
                        "Validación pendiente"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase text-[color:var(--vm-color-ink-muted)]">
                      Siguiente acción
                    </div>
                    <div className="mt-1 text-xs font-semibold">
                      {lead.evaluation.nextAction}
                    </div>
                    {total ? (
                      <div className="mt-1 text-[11px] text-[color:var(--vm-color-ink-muted)]">
                        {completed} de {total} hitos completados
                      </div>
                    ) : null}
                  </div>
                  <Link
                    href={`/asesor/leads/${encodeURIComponent(lead.scenario.leadId)}`}
                    aria-label={`Abrir detalle de ${lead.scenario.displayName}`}
                    className="grid h-10 w-10 place-items-center rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] text-[color:var(--vm-color-brand-blue)]"
                  >
                    <Icon name="chevron" className="h-4 w-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <Icon
              name="check"
              className="mx-auto h-6 w-6 text-[color:var(--vm-color-success)]"
            />
            <p className="mt-3 text-sm font-semibold">
              No hay casos vivos en acompañamiento
            </p>
            <p className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">
              Las nuevas rutas aparecerán aquí después del perfilamiento.
            </p>
          </div>
        )}
      </section>

      <CommercialDashboard />
    </div>
  );
}

function profileLabel(value: string | undefined): string {
  return {
    AFFILIATE: "Afiliado",
    NON_AFFILIATE: "No afiliado",
    FORMER_AFFILIATE: "Exafiliado",
    FAMILY_GROUP: "Grupo familiar",
  }[value ?? ""] ?? "Afiliación por validar";
}
