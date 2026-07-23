"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { Pill, ProgressBar } from "@/components/ui";
import {
  formatProjectPrice,
  getValidityLabel,
} from "@/lib/housing-catalog";
import type { EvaluationResult } from "../domain";
import { resolveProjectMatches } from "../matching";
import { formatCop, getProfileValue } from "../profile-copy";
import { getQualifiedScenarioLead, isCommercialOpportunity, type QualifiedLead } from "../qualified-leads";
import { findSessionByLeadId } from "../storage";
import { buildPublicScenario } from "@/features/prospect/engine";
import type { ProspectSession } from "@/features/prospect/domain";
import { findProspectSessionByLeadId } from "@/features/prospect/storage";
import { CommercialActions } from "@/features/advisor/components/commercial-actions";

const routeLabels: Record<EvaluationResult["route"], string> = {
  ADVISOR_NOW: "Oportunidad comercial",
  NON_AFFILIATE_PRIORITY: "Oportunidad comercial",
  NURTURE_FINANCIAL: "Acompañamiento",
  NURTURE_BENEFITS: "Acompañamiento",
  NURTURE_LONG_TERM: "Acompañamiento",
  NEEDS_DATA: "Acompañamiento",
  OPTED_OUT: "Sin contacto",
};

export function AdvisorIntelligence({ leadId }: { leadId: string }) {
  const [qualifiedLead, setQualifiedLead] = useState<QualifiedLead | undefined>(() => getQualifiedScenarioLead(leadId));
  const [prospectSession, setProspectSession] = useState<ProspectSession>();
  const scenario = qualifiedLead?.scenario;
  const evaluation = qualifiedLead?.evaluation;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = findSessionByLeadId(leadId);
      const canonicalLead = getQualifiedScenarioLead(leadId);
      if (session?.evaluation && canonicalLead) {
        setQualifiedLead({ ...canonicalLead, evaluation: session.evaluation });
      }
      const publicSession = findProspectSessionByLeadId(leadId);
      if (publicSession?.evaluation) {
        setProspectSession(publicSession);
        setQualifiedLead({
          scenario: buildPublicScenario(publicSession),
          evaluation: publicSession.evaluation,
        });
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [leadId]);

  if (!scenario || !evaluation) return null;

  const projectMatches = resolveProjectMatches(evaluation.projectMatches);
  const initials = scenario.displayName.slice(0, 2).toUpperCase();
  const priorityLabel = evaluation.priority === "HIGH" ? "Alta" : evaluation.priority === "MEDIUM" ? "Media" : "Baja";
  const confidence = Math.round(evaluation.confidenceScore * 100);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
      <div className="space-y-5">
        <section className="surface-solid p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] font-bold text-white">{initials}</span>
            <div>
              <h2 className="text-2xl font-semibold">{scenario.displayName}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill tone={evaluation.priority === "HIGH" ? "green" : "yellow"}>{priorityLabel} prioridad</Pill>
                <Pill>{routeLabels[evaluation.route]}</Pill>
                <Pill tone="gray">{scenario.leadSource === "META" ? "Meta · pago" : "Canal orgánico"}</Pill>
              </div>
            </div>
          </div>

          <p className="mt-6 rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.04] p-4 text-sm font-semibold leading-6">{evaluation.commercialSummary}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Metric label="Propensión comercial" value={`${evaluation.readinessScore}/100`} accent />
            <Metric label="Confianza del perfil" value={`${confidence}%`} />
            <Metric label="Cuota máxima orientativa" value={evaluation.capacity.estimatedHousingPayment ? formatCop(evaluation.capacity.estimatedHousingPayment) : "Por completar"} />
          </div>
          <div className="mt-6"><ProgressBar value={evaluation.readinessScore} label="Preparación comercial" /></div>
        </section>

        {prospectSession ? (
          <section className="surface-solid p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Lo que descubrió la conversación</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Contexto declarado por el prospecto, separado de los datos que Colsubsidio ya conocía.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ProfileItem label="Sueño de vivienda" value={prospectSession.discovery.housingVision ?? "Por completar"} />
              <ProfileItem label="Para quién" value={prospectSession.discovery.intendedFor ?? "Por completar"} />
              <ProfileItem label="Motivación actual" value={prospectSession.discovery.motivation ?? "Por completar"} />
              <ProfileItem label="Principal barrera" value={prospectSession.discovery.obstacle ?? evaluation.blockers[0] ?? "Por completar"} />
              <ProfileItem label="Qué necesita para avanzar" value={prospectSession.discovery.advanceNeed ?? "Por completar"} />
            </div>
            <div className="mt-5 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Último mensaje del prospecto</div>
              <p className="mt-2 text-sm leading-6">{prospectSession.turns.at(-1)?.userText ?? "Sin mensajes registrados"}</p>
            </div>
          </section>
        ) : null}

        {prospectSession?.turns.length ? (
          <section className="surface-solid p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Conversación completa</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Evidencia original de lo declarado por el prospecto y de la orientación entregada.</p>
              </div>
              <Pill tone="gray">{prospectSession.turns.length} intercambios</Pill>
            </div>
            <ol className="mt-5 space-y-5">
              {prospectSession.turns.map((turn) => (
                <li key={turn.id} className="space-y-3">
                  <div className="ml-auto max-w-[88%] rounded-[20px_20px_6px_20px] bg-[color:var(--vm-color-brand-blue)] p-4 text-sm leading-6 text-white">
                    {turn.userText}
                  </div>
                  <div className="max-w-[88%] rounded-[20px_20px_20px_6px] border border-[color:var(--vm-color-line)] bg-[color:var(--vm-color-canvas)] p-4 text-sm leading-6">
                    {turn.assistantText}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section className="surface-solid p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Lo que sabemos del prospecto</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ProfileItem label="Sueño" value={getProfileValue(evaluation.profileSnapshot, "dreamGoal")} />
            <ProfileItem label="Horizonte" value={getProfileValue(evaluation.profileSnapshot, "horizon")} />
            <ProfileItem label="Ubicación" value={getProfileValue(evaluation.profileSnapshot, "location")} />
            <ProfileItem label="Hogar" value={getProfileValue(evaluation.profileSnapshot, "householdSize")} />
            <ProfileItem label="Afiliación" value={getProfileValue(evaluation.profileSnapshot, "affiliation")} />
            <ProfileItem label="Ahorro" value={getProfileValue(evaluation.profileSnapshot, "savings")} />
          </div>
          <div className="mt-5 text-xs text-[color:var(--vm-color-ink-muted)]">Datos conocidos utilizados: {evaluation.knownDataUsed.length ? evaluation.knownDataUsed.length : "ninguno"}. El resto fue declarado durante la conversación.</div>
        </section>

        <section className="surface-solid p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Validación de capacidad 40 %</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">La estimación evita que obligaciones actuales y cuota de vivienda superen conjuntamente el 40 % del ingreso.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ProfileItem label="Ingreso estimado" value={evaluation.capacity.monthlyIncomeEstimate ? formatCop(evaluation.capacity.monthlyIncomeEstimate) : "Por confirmar"} />
            <ProfileItem label="Obligaciones" value={`${Math.round(evaluation.capacity.currentCommitmentRatio * 100)} %`} />
            <ProfileItem label="Margen vivienda" value={`${Math.round(evaluation.capacity.maximumHousingRatio * 100)} %`} />
          </div>
        </section>

        <section className="surface-solid p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Beneficios y señales de comportamiento</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-success)]">Beneficios confirmados</div>
              <ul className="mt-3 space-y-2 text-sm">{evaluation.benefitSignals.confirmed.length ? evaluation.benefitSignals.confirmed.map((item) => <li key={item}>• {item}</li>) : <li className="text-[color:var(--vm-color-ink-muted)]">Sin beneficios confirmados</li>}</ul>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-warning)]">Beneficios por validar</div>
              <ul className="mt-3 space-y-2 text-sm">{evaluation.benefitSignals.potential.length ? evaluation.benefitSignals.potential.map((item) => <li key={item}>• {item}</li>) : <li className="text-[color:var(--vm-color-ink-muted)]">Sin señales suficientes</li>}</ul>
            </div>
          </div>
          <div className="mt-6 border-t border-[color:var(--vm-color-line)] pt-5">
            <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">Comportamiento conocido</div>
            <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">{scenario.engagementSignals.map((item) => <li key={item}>• {item}</li>)}</ul>
          </div>
        </section>

        {projectMatches.length ? (
          <section className="surface-solid p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Proyectos y evidencia utilizados</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Es la misma recomendación que recibió el prospecto, sin recalcular el ranking en el portal.</p>
            <div className="mt-5 space-y-4">
              {projectMatches.map(({ project, match }, index) => {
                const evidence = project.evidence.filter(({ id }) => match.evidenceSourceIds.includes(id));
                return (
                  <article key={project.id} className="rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Recomendación {index + 1}</div>
                        <h3 className="mt-1 text-xl font-semibold">{project.name}</h3>
                        <div className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">{project.location.city} · {project.location.development}</div>
                      </div>
                      <Pill tone={match.signals.includes("CAMPAIGN") ? "yellow" : "blue"}>{match.signals.includes("CAMPAIGN") ? "Origen Meta" : "Coincidencia de perfil"}</Pill>
                    </div>
                    <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                      <EvidenceFact label="Precio" value={project.priceFromCop.validity === "CURRENT" ? formatProjectPrice(project) : "Por confirmar"} />
                      <EvidenceFact label="Inventario" value={getValidityLabel(project.inventory.validity)} />
                      <EvidenceFact label="Entrega" value={getValidityLabel(project.deliveryDate.validity)} />
                    </div>
                    <ul className="mt-4 space-y-2 text-sm leading-5 text-[color:var(--vm-color-ink-muted)]">
                      {match.reasons.map((reason) => <li key={reason} className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--vm-color-success)]" />{reason}</li>)}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-[color:var(--vm-color-line)] pt-4">
                      {evidence.map((source) => source.url ? <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[color:var(--vm-color-line)] px-3 text-xs font-semibold text-[color:var(--vm-color-brand-blue)]">{source.title}<Icon name="arrow" className="h-3 w-3" /></a> : <span key={source.id} className="text-xs text-[color:var(--vm-color-ink-muted)]">{source.title}</span>)}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>

      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <CommercialActions leadId={leadId} />
        <section className="rounded-[var(--vm-radius-elevated)] border border-[color:var(--vm-color-brand-blue)]/20 bg-[linear-gradient(145deg,#eef8ff,#fffdf0)] p-6 shadow-[var(--vm-shadow-medium)]">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-[.14em] text-[color:var(--vm-color-brand-blue)]">Próxima mejor acción</div>
            <Icon name="sparkles" className="h-5 w-5 text-[color:var(--vm-color-brand-blue)]" />
          </div>
          <h3 className="mt-5 text-2xl font-semibold tracking-[-.04em]">{evaluation.nextAction}</h3>
          <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{evaluation.blockers[0] ?? "No se identificaron bloqueos principales."}</p>
          <Link href={isCommercialOpportunity(evaluation) ? "/asesor/agenda" : "/asesor/nutricion"} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white">
            {isCommercialOpportunity(evaluation) ? "Abrir agenda" : "Abrir acompañamiento"} <Icon name={isCommercialOpportunity(evaluation) ? "calendar" : "heart"} className="h-4 w-4" />
          </Link>
        </section>

        {projectMatches.length ? (
          <section className="surface-solid p-6">
            <h3 className="text-lg font-semibold">Recomendación compartida</h3>
            <ol className="mt-4 space-y-2 text-sm">
              {projectMatches.map(({ project }, index) => <li key={project.id} className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-xs font-bold text-[color:var(--vm-color-brand-blue)]">{index + 1}</span><span className="font-semibold">{project.name}</span></li>)}
            </ol>
            <p className="mt-3 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">Máximo tres opciones; precio, inventario y entrega conservan su vigencia del catálogo.</p>
            <Link href="/asesor/comparador" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[color:var(--vm-color-brand-blue)]/15 text-xs font-semibold text-[color:var(--vm-color-brand-blue)]"><Icon name="compare" className="h-4 w-4" />Abrir comparador</Link>
          </section>
        ) : null}
      </aside>
    </div>
  );
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className={`rounded-[var(--vm-radius-card)] p-5 ${accent ? "bg-[color:var(--vm-color-brand-blue)] text-white" : "bg-[color:var(--vm-color-brand-blue)]/[.04]"}`}><div className={`text-[10px] uppercase tracking-[.12em] ${accent ? "text-white/75" : "text-[color:var(--vm-color-ink-muted)]"}`}>{label}</div><div className="mt-2 text-2xl font-semibold">{value}</div></div>;
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[18px] border border-[color:var(--vm-color-line)] p-4"><div className="text-[10px] uppercase tracking-[.11em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-2 text-sm font-semibold">{value}</div></div>;
}

function EvidenceFact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.035] p-3"><div className="text-[9px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-1 font-semibold">{value}</div></div>;
}
