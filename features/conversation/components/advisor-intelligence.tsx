"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import type { EvaluationResult } from "../domain";
import { resolveProjectMatches } from "../matching";
import { formatCop, getProfileValue } from "../profile-copy";
import { getQualifiedScenarioLead, type QualifiedLead } from "../qualified-leads";
import { findSessionByLeadId } from "../storage";
import { buildPublicScenario } from "@/features/prospect/engine";
import type { ProspectSession } from "@/features/prospect/domain";
import { findProspectSessionByLeadId } from "@/features/prospect/storage";
import { CommercialActions } from "@/features/advisor/components/commercial-actions";
import { CommercialNextStep } from "@/features/advisor/components/commercial-next-step";
import { AdvisorProjectExplorer } from "@/features/advisor/components/advisor-project-explorer";
import {
  getEvidencePresentation,
  getReadinessPresentation,
} from "../readiness-presentation";

const routeLabels: Record<EvaluationResult["route"], string> = {
  ADVISOR_NOW: "Oportunidad comercial",
  NON_AFFILIATE_PRIORITY: "Oportunidad comercial",
  NURTURE_FINANCIAL: "Acompañamiento",
  NURTURE_BENEFITS: "Acompañamiento",
  NURTURE_LONG_TERM: "Acompañamiento",
  NEEDS_DATA: "Acompañamiento",
  OPTED_OUT: "Sin contacto",
};

type DetailTab = "SUMMARY" | "PROJECTS" | "CONVERSATION" | "ACTIVITY";

const detailTabs: Array<{
  value: DetailTab;
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
}> = [
  { value: "SUMMARY", label: "Perfil y capacidad", icon: "document" },
  { value: "PROJECTS", label: "Viviendas recomendadas", icon: "building" },
  { value: "CONVERSATION", label: "Conversación", icon: "mail" },
  { value: "ACTIVITY", label: "Gestionar oportunidad", icon: "target" },
];

export function AdvisorIntelligence({
  leadId,
  embedded = false,
}: {
  leadId: string;
  embedded?: boolean;
}) {
  const [qualifiedLead, setQualifiedLead] = useState<QualifiedLead | undefined>(() => getQualifiedScenarioLead(leadId));
  const [prospectSession, setProspectSession] = useState<ProspectSession>();
  const [activeTab, setActiveTab] = useState<DetailTab>("SUMMARY");
  const detailTopRef = useRef<HTMLDivElement>(null);
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
  const readiness = getReadinessPresentation(evaluation.readinessScore);
  const evidence = getEvidencePresentation(evaluation.confidenceScore);
  const calculatedAt = formatCalculationDate(scenario.capturedAt);
  const primaryProject = projectMatches[0]?.project;

  function openTab(tab: DetailTab) {
    setActiveTab(tab);
    window.requestAnimationFrame(() => {
      detailTopRef.current?.scrollIntoView({ block: "start" });
    });
  }

  return (
    <div ref={detailTopRef} className="scroll-mt-20 space-y-4">
      <CommercialNextStep
        leadId={leadId}
        evaluation={evaluation}
        compact
        onManage={() => openTab("ACTIVITY")}
      />
      <div className="space-y-5">
        <section className={`advisor-opportunity-focus surface-solid ${embedded ? "p-5" : "p-6 sm:p-8"}`}>
          <div className="advisor-opportunity-focus__identity">
            <div className="advisor-opportunity-focus__person">
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] font-bold text-white">{initials}</span>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
                    Oportunidad seleccionada
                  </div>
                  <h2 className="mt-1 text-2xl font-semibold">{scenario.displayName}</h2>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill tone={evaluation.priority === "HIGH" ? "green" : "yellow"}>{priorityLabel} prioridad</Pill>
                <Pill>{routeLabels[evaluation.route]}</Pill>
                <Pill tone="gray">{scenario.leadSource === "META" ? "Meta · pago" : "Canal orgánico"}</Pill>
              </div>
            </div>
            {primaryProject ? (
              <div className="advisor-opportunity-focus__project">
                <Image
                  src={primaryProject.image}
                  alt=""
                  fill
                  sizes={embedded ? "360px" : "480px"}
                  quality={90}
                  className="object-cover"
                />
                <span />
                <div>
                  <small>Proyecto principal</small>
                  <strong>{primaryProject.name}</strong>
                  <p>{primaryProject.location.city} · {primaryProject.location.development}</p>
                </div>
              </div>
            ) : null}
          </div>

          <p className="mt-5 rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.04] p-4 text-sm font-semibold leading-6">{evaluation.commercialSummary}</p>

          {activeTab === "SUMMARY" ? (
            <>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Metric
                  label="Preparación comercial"
                  value={readiness.label}
                  accent
                  help={readiness.description}
                  calculatedAt={calculatedAt}
                />
                <Metric
                  label="Información disponible"
                  value={evidence.label}
                  help={evidence.description}
                  calculatedAt={calculatedAt}
                />
                <Metric label="Cuota máxima orientativa" value={evaluation.capacity.estimatedHousingPayment ? formatCop(evaluation.capacity.estimatedHousingPayment) : "Por completar"} />
              </div>
              <div className="mt-5 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] p-4">
                <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">
                  Por qué tiene esta preparación
                </div>
                <ul className="mt-3 grid gap-2 text-xs leading-5 sm:grid-cols-2">
                  {evaluation.factors.slice(0, 4).map((factor) => (
                    <li key={factor} className="flex gap-2">
                      <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--vm-color-success)]" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}

          <nav aria-label="Secciones de la oportunidad" className="advisor-opportunity-tabs -mx-1 mt-5 flex gap-1 overflow-x-auto border-t border-[color:var(--vm-color-line)] px-1 pt-4">
            {detailTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => openTab(tab.value)}
                aria-pressed={activeTab === tab.value}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-xs font-bold transition ${
                  activeTab === tab.value
                    ? "bg-[color:var(--vm-color-brand-blue)] text-white"
                    : "text-[color:var(--vm-color-ink-muted)] hover:bg-[color:var(--vm-color-brand-blue)]/[.05] hover:text-[color:var(--vm-color-brand-blue)]"
                }`}
              >
                <Icon name={tab.icon} className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </section>

        {activeTab === "SUMMARY" && prospectSession ? (
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
              <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">Último mensaje del prospecto</div>
              <p className="mt-2 text-sm leading-6">{prospectSession.turns.at(-1)?.userText ?? "Sin mensajes registrados"}</p>
            </div>
          </section>
        ) : null}

        {activeTab === "CONVERSATION" && prospectSession?.turns.length ? (
          <section className="surface-solid p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Conversación completa</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Registro original de lo declarado por el prospecto y de la orientación entregada.</p>
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

        {activeTab === "CONVERSATION" && !prospectSession?.turns.length ? (
          <section className="surface-solid p-8 text-center">
            <Icon name="mail" className="mx-auto h-6 w-6 text-[color:var(--vm-color-brand-blue)]" />
            <h2 className="mt-3 font-semibold">No hay conversación disponible</h2>
            <p className="mt-1 text-sm text-[color:var(--vm-color-ink-muted)]">Esta oportunidad conserva únicamente los datos de evaluación conocidos.</p>
          </section>
        ) : null}

        {activeTab === "SUMMARY" ? <section className="surface-solid p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Lo que sabemos del prospecto</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ProfileItem label="Sueño" value={getProfileValue(evaluation.profileSnapshot, "dreamGoal")} />
            <ProfileItem label="Horizonte" value={getProfileValue(evaluation.profileSnapshot, "horizon")} />
            <ProfileItem label="Ubicación" value={contextualProfileValue(evaluation, "location", "Ubicación por confirmar")} />
            <ProfileItem label="Hogar" value={getProfileValue(evaluation.profileSnapshot, "householdSize")} />
            <ProfileItem label="Afiliación" value={contextualProfileValue(evaluation, "affiliation", "Afiliación por confirmar")} />
            <ProfileItem label="Ahorro" value={getProfileValue(evaluation.profileSnapshot, "savings")} />
          </div>
          <div className="mt-5 text-xs text-[color:var(--vm-color-ink-muted)]">Datos conocidos utilizados: {evaluation.knownDataUsed.length ? evaluation.knownDataUsed.length : "ninguno"}. El resto fue declarado durante la conversación.</div>
        </section> : null}

        {activeTab === "SUMMARY" ? <section className="surface-solid p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Validación de capacidad 40 %</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">La estimación evita que obligaciones actuales y cuota de vivienda superen conjuntamente el 40 % del ingreso.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ProfileItem label="Ingreso estimado" value={evaluation.capacity.monthlyIncomeEstimate ? formatCop(evaluation.capacity.monthlyIncomeEstimate) : "Por confirmar"} />
            <ProfileItem label="Obligaciones" value={`${Math.round(evaluation.capacity.currentCommitmentRatio * 100)} %`} />
            <ProfileItem label="Margen vivienda" value={`${Math.round(evaluation.capacity.maximumHousingRatio * 100)} %`} />
          </div>
        </section> : null}

        {activeTab === "SUMMARY" ? <section className="surface-solid p-6 sm:p-8">
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
        </section> : null}

        {activeTab === "PROJECTS" && projectMatches.length ? (
          <AdvisorProjectExplorer matches={projectMatches} />
        ) : activeTab === "PROJECTS" ? (
          <section className="surface-solid p-8 text-center">
            <Icon name="building" className="mx-auto h-6 w-6 text-[color:var(--vm-color-brand-blue)]" />
            <h2 className="mt-3 font-semibold">No hay proyectos compatibles</h2>
            <p className="mt-1 text-sm text-[color:var(--vm-color-ink-muted)]">La evaluación no produjo coincidencias verificables para esta oportunidad.</p>
          </section>
        ) : null}
      </div>

      {activeTab === "ACTIVITY" ? (
        <div className="mx-auto max-w-3xl">
          <CommercialActions leadId={leadId} />
        </div>
      ) : null}

      {activeTab === "PROJECTS" && projectMatches.length ? (
        <div className="flex min-w-0 justify-end">
          <Link href={`/asesor/comparador?leadId=${encodeURIComponent(leadId)}`} className="inline-flex min-h-11 min-w-0 max-w-full items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-center text-xs font-bold whitespace-normal text-white"><Icon name="compare" className="h-4 w-4 shrink-0" />Comparar estas opciones</Link>
        </div>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
  accent = false,
  help,
  calculatedAt,
}: {
  label: string;
  value: string;
  accent?: boolean;
  help?: string;
  calculatedAt?: string;
}) {
  return (
    <div className={`relative rounded-[var(--vm-radius-card)] p-5 ${accent ? "bg-[color:var(--vm-color-brand-blue)] text-white" : "bg-[color:var(--vm-color-brand-blue)]/[.04]"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`text-xs uppercase tracking-[.08em] ${accent ? "text-white/80" : "text-[color:var(--vm-color-ink-muted)]"}`}>{label}</div>
        {help ? (
          <details className="group relative">
            <summary
              aria-label={`Explicar ${label}`}
              className={`grid h-7 w-7 cursor-pointer list-none place-items-center rounded-full border [&::-webkit-details-marker]:hidden ${accent ? "border-white/25 text-white" : "border-[color:var(--vm-color-line)] bg-white text-[color:var(--vm-color-brand-blue)]"}`}
            >
              <Icon name="info" className="h-3.5 w-3.5" />
            </summary>
            <div className="absolute right-0 top-9 z-30 w-64 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-white p-3 text-left text-[11px] font-normal leading-5 text-[color:var(--vm-color-ink)] shadow-[var(--vm-shadow-medium)]">
              <p>{help}</p>
              {calculatedAt ? (
                <p className="mt-2 border-t border-[color:var(--vm-color-line)] pt-2 text-xs text-[color:var(--vm-color-ink-muted)]">
                  Calculado: {calculatedAt}
                </p>
              ) : null}
            </div>
          </details>
        ) : null}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] p-4"><div className="text-xs uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-2 text-sm font-semibold">{value}</div></div>;
}

function contextualProfileValue(
  evaluation: EvaluationResult,
  field: "location" | "affiliation",
  fallback: string,
): string {
  return evaluation.profileSnapshot[field]
    ? getProfileValue(evaluation.profileSnapshot, field)
    : fallback;
}

function formatCalculationDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
