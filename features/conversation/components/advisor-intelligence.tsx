"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { Pill, ProgressBar } from "@/components/ui";
import { getHousingProjects } from "@/lib/housing-catalog";
import type { EvaluationResult } from "../domain";
import { formatCop, getProfileValue } from "../profile-copy";
import { getQualifiedScenarioLead, isCommercialOpportunity, type QualifiedLead } from "../qualified-leads";
import { findSessionByLeadId } from "../storage";
import { buildPublicScenario } from "@/features/prospect/engine";
import type { ProspectSession } from "@/features/prospect/domain";
import { findProspectSessionByLeadId } from "@/features/prospect/storage";

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

  const project = getHousingProjects(evaluation.projectIds)[0];
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
              <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-warning)]">Beneficios por validar</div>
              <ul className="mt-3 space-y-2 text-sm">{evaluation.benefitSignals.potential.length ? evaluation.benefitSignals.potential.map((item) => <li key={item}>• {item}</li>) : <li className="text-[color:var(--vm-color-ink-muted)]">Sin señales suficientes</li>}</ul>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">Comportamiento conocido</div>
              <ul className="mt-3 space-y-2 text-sm">{scenario.engagementSignals.map((item) => <li key={item}>• {item}</li>)}</ul>
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
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

        {project ? (
          <section className="surface-solid p-6">
            <h3 className="text-lg font-semibold">Proyecto recomendado</h3>
            <div className="mt-4 text-xl font-semibold">{project.name}</div>
            <p className="mt-2 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">Coincidencia preliminar; validar disponibilidad y financiación.</p>
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
