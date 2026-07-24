"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icon";
import {
  HousingWindow,
  OrientationHeader,
} from "@/components/orientation-visuals";
import type {
  EvaluationResult,
  ProfileField,
  ProjectMatch,
} from "@/features/conversation/domain";
import { resolveProjectMatches } from "@/features/conversation/matching";
import { formatCop, getProfileValue } from "@/features/conversation/profile-copy";
import {
  formatProjectAreaRange,
  formatProjectPrice,
  formatVerificationDate,
  getProjectEvidence,
  type HousingProject,
} from "@/lib/housing-catalog";
import { createFunnelEvent, trackFunnelEvent } from "../analytics";
import type { ProspectSession, ServiceGuidance } from "../domain";
import type { ProspectContactRequest } from "../handoff";
import { loadContactRequest } from "../handoff-storage";
import { getCapacityRange } from "../capacity";
import type { CanonicalJourneyResponse } from "@/lib/api/leads";
import {
  PROJECT_REFERENCE_NOTICE,
  PROJECT_VALIDITY_NOTICE,
} from "../result-copy";
import { loadProspectSession } from "../storage";

export function ProspectResult({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<ProspectSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [contactRequest, setContactRequest] =
    useState<ProspectContactRequest>();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadProspectSession(sessionId) ?? null;
      setSession(stored);
      setContactRequest(loadContactRequest(sessionId));
      setLoaded(true);
      if (
        stored?.status === "COMPLETED" &&
        (stored.evaluation || stored.serviceGuidance)
      ) {
        const viewedKey = `vivienda-match:result-viewed:${stored.id}`;
        if (!window.sessionStorage.getItem(viewedKey)) {
          trackFunnelEvent(createFunnelEvent({
            name: "RESULT_VIEWED",
            acquisition: stored.acquisition,
            sessionId: stored.id,
            occurredAt: new Date().toISOString(),
          }));
          window.sessionStorage.setItem(viewedKey, "1");
        }
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [sessionId]);

  useEffect(() => {
    if (
      !loaded ||
      !session ||
      session.status !== "COMPLETED" ||
      (!session.evaluation && !session.serviceGuidance)
    ) {
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setShowResult(true), reduceMotion ? 0 : 480);
    return () => window.clearTimeout(timer);
  }, [loaded, session]);

  if (!loaded) return <ResultState title="Preparando tu orientación…" description="Estamos organizando lo que entendimos y el siguiente paso." />;
  if (!session) return <ResultState title="No encontramos esta orientación." description="El resultado está disponible en el dispositivo donde completaste la conversación." action={{ label: "Empezar orientación", href: "/orientacion" }} />;
  if (
    session.status !== "COMPLETED" ||
    (!session.evaluation && !session.serviceGuidance)
  ) {
    return <ResultState title="La conversación todavía no ha terminado." description="Continúa conversando para que podamos comprender tu situación y darte una orientación responsable." action={{ label: "Continuar", href: `/orientacion/${session.id}` }} />;
  }
  if (!showResult) return <ResultTransition />;
  if (session.serviceGuidance) {
    return (
      <ServiceGuidanceResult
        firstName={session.firstName}
        guidance={session.serviceGuidance}
      />
    );
  }

  const evaluation = session.evaluation!;
  const authoritative = session.authoritativeJourney;
  const capacityRange = getCapacityRange(
    authoritative?.capacity.estimated_monthly_payment ??
      evaluation.capacity.estimatedHousingPayment,
  );
  const capacityDisplay = capacityRange
    ? `${formatCop(capacityRange.minimum)} – ${formatCop(capacityRange.maximum)}`
    : "Por completar";
  const projectMatches = authoritative
    ? authoritative.recommendations.map((recommendation) => ({
        projectId: recommendation.project_id,
        score: 100 - recommendation.rank,
        signals: [],
        reasons: recommendation.reasons,
        evidenceSourceIds: [],
      }))
    : evaluation.projectMatches;
  const matchedProjects = resolveProjectMatches(projectMatches);
  const readyForAdvisor = authoritative
    ? ["READY_TO_CLOSE", "NON_AFFILIATE_REVIEW"].includes(authoritative.route)
    : evaluation.route === "ADVISOR_NOW" ||
      evaluation.route === "NON_AFFILIATE_PRIORITY";
  const actionHref = readyForAdvisor
    ? `/vivienda/agendar?from=orientacion&sessionId=${encodeURIComponent(session.id)}`
    : "#plan-preparacion";
  const actionLabel = readyForAdvisor
    ? contactRequest
      ? "Ver estado de mi solicitud"
      : "Solicitar contacto"
    : "Revisar mi plan de preparación";
  const profileSummary = buildProfileSummary(evaluation);

  function trackAction() {
    trackFunnelEvent(createFunnelEvent({
      name: "NEXT_ACTION_CLICKED",
      acquisition: session!.acquisition,
      sessionId: session!.id,
      occurredAt: new Date().toISOString(),
    }));
  }

  return (
    <div className="orientation-experience">
      <OrientationHeader status="Orientación lista" statusTone="success" />

      <main className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 lg:py-12">
        <section className="orientation-result-hero result-reveal result-reveal--1 grid gap-8 p-7 sm:p-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)] lg:items-end lg:p-12">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-success)]">
              {session.firstName ? `Tu orientación, ${session.firstName}` : "Tu orientación personalizada"}
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-[.98] tracking-[-.055em] sm:text-6xl">
              {readyForAdvisor
                ? "Tu perfil parece listo para avanzar."
                : authoritative?.readiness.level === "INITIAL"
                  ? "Estás construyendo las condiciones para avanzar."
                  : preparationTitle(evaluation.route)}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[color:var(--vm-color-ink-muted)] sm:text-lg sm:leading-8">
              Organizamos lo que entendimos de tu búsqueda y lo convertimos en
              una ruta clara para tu momento actual.
            </p>
          </div>
          <div className="orientation-capacity-card p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
                Cuota mensual orientativa
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--vm-color-brand-yellow)]/30 text-[color:var(--vm-color-brand-blue)]">
                <Icon name="money" className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-5 text-2xl font-semibold leading-tight tracking-[-.045em] sm:text-3xl">
              {capacityDisplay}
            </div>
            <p className="mt-3 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
              {capacityRange
                ? "Rango prudente estimado a partir de la información disponible."
                : "Completa o fortalece la información financiera para estimar un rango."}
            </p>
            <div className="mt-5 border-t border-[color:var(--vm-color-line)] pt-4 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
              {authoritative?.capacity.disclaimer ??
                "No constituye aprobación de crédito, subsidio o disponibilidad."}
            </div>
          </div>
        </section>

        <section className="orientation-section result-reveal result-reveal--2 mt-6 p-6 sm:p-8">
          <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Lo que entendimos</div>
          <h2 className="mt-2 text-2xl font-semibold">Este es tu punto de partida.</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {profileSummary.map(({ label, value }) => <Understanding key={label} label={label} value={value} />)}
          </div>
        </section>

        <section className="orientation-section result-reveal result-reveal--3 mt-6 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Beneficios con total claridad</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Separamos lo que ya está confirmado de aquello que todavía requiere una revisión.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <BenefitPanel title="Confirmados" items={evaluation.benefitSignals.confirmed} empty="No hay beneficios confirmados todavía." tone="success" />
            <BenefitPanel title="Podrías validar" items={evaluation.benefitSignals.potential} empty="Con la información actual no identificamos beneficios adicionales." tone="warning" />
          </div>
        </section>

        {readyForAdvisor && matchedProjects.length ? (
          <ProjectRecommendations matches={matchedProjects} readyForAdvisor />
        ) : null}

        {!readyForAdvisor ? (
          <PreparationPlan
            evaluation={evaluation}
            capacityDisplay={capacityDisplay}
            authoritative={authoritative}
          />
        ) : null}

        {!readyForAdvisor && matchedProjects.length ? (
          <ProjectRecommendations matches={matchedProjects} readyForAdvisor={false} />
        ) : null}

        <section className="surface-result-action result-reveal result-reveal--4 mt-8 overflow-hidden rounded-[var(--vm-radius-elevated)] p-7 sm:flex sm:items-end sm:justify-between sm:gap-8 sm:p-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
              {contactRequest ? "Solicitud en proceso" : "Tu siguiente acción"}
            </div>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-.04em]">
              {contactRequest
                ? "Tu preferencia de contacto quedó registrada."
                : readyForAdvisor
                  ? "Ya puedes solicitar acompañamiento."
                  : "Avanza a tu ritmo con una meta clara."}
            </h2>
            {contactRequest ? (
              <p className="mt-3 max-w-xl text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
                El equipo de vivienda deberá revisar tu orientación y confirmar el contacto.
              </p>
            ) : null}
          </div>
          <Link href={actionHref} onClick={trackAction} className="mt-6 inline-flex min-h-13 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[color:var(--vm-color-brand-blue-deep)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] sm:mt-0 sm:w-auto">
            {actionLabel}<Icon name="arrow" className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}

function ServiceGuidanceResult({
  firstName,
  guidance,
}: {
  firstName?: string;
  guidance: ServiceGuidance;
}) {
  return (
    <div className="orientation-experience">
      <OrientationHeader status="Ruta identificada" statusTone="success" />

      <main className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 lg:py-12">
        <section className="orientation-result-hero result-reveal result-reveal--1 p-7 sm:p-10 lg:p-12">
          <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-success)]">
            {firstName ? `Tu orientación, ${firstName}` : "Tu orientación"}
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-.04em] sm:text-5xl">
            {guidance.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--vm-color-ink-muted)]">
            {guidance.description}
          </p>
        </section>

        <section className="orientation-section result-reveal result-reveal--2 mt-6 p-6 sm:p-8">
          <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
            Información reconocida
          </div>
          <h2 className="mt-2 text-2xl font-semibold">
            Partimos de tu relación anterior con Colsubsidio.
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {guidance.knownContext.map((item) => (
              <div
                key={item}
                className="rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.04] p-4 text-sm font-semibold leading-6"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="result-reveal result-reveal--3 mt-6 grid gap-4 md:grid-cols-3">
          <GuidanceSummary
            icon="money"
            label="Capacidad preliminar"
            value={guidance.capacitySummary}
          />
          <GuidanceSummary
            icon="check"
            label="Beneficios y apoyos"
            value={guidance.benefitSummary.join(" ")}
          />
          <GuidanceSummary
            icon="building"
            label="Proyectos"
            value={guidance.projectSummary}
          />
        </section>

        <section className="surface-result-action result-reveal result-reveal--4 mt-8 rounded-[var(--vm-radius-elevated)] p-7 sm:p-10">
          <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
            Siguiente paso
          </div>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-.04em]">
            {guidance.nextAction}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
            Tu avance se guarda únicamente en este dispositivo. Para iniciar una
            solicitud en los canales de servicio deberás confirmar el siguiente paso.
          </p>
        </section>
      </main>
    </div>
  );
}

function GuidanceSummary({
  icon,
  label,
  value,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  value: string;
}) {
  return (
    <article className="surface-solid p-5">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <div className="mt-4 text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">
        {label}
      </div>
      <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
        {value}
      </p>
    </article>
  );
}

function ResultTransition() {
  return (
    <div className="orientation-experience grid min-h-screen place-items-center px-5">
      <section className="result-transition max-w-2xl text-center" role="status" aria-live="polite">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white shadow-[var(--vm-shadow-medium)]">
          <span className="block h-3 w-3 rounded-full bg-[color:var(--vm-color-brand-yellow)] shadow-[var(--vm-shadow-accent)]" />
        </div>
        <div className="mt-7 text-[11px] font-bold uppercase tracking-[.14em] text-[color:var(--vm-color-brand-blue)]">
          Construyendo tu ruta
        </div>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-.055em] sm:text-5xl">
          Ya tenemos suficiente información para orientarte.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
          Estamos organizando capacidad, beneficios y proyectos en un siguiente
          paso fácil de entender.
        </p>
      </section>
    </div>
  );
}

function buildProfileSummary(evaluation: EvaluationResult): Array<{ label: string; value: string }> {
  const fields: Array<[string, ProfileField]> = [
    ["Lo más importante", "mainConcern"],
    ["Zona", "location"],
    ["Momento de compra", "horizon"],
    ["Personas en el hogar", "householdSize"],
    ["Afiliación", "affiliation"],
  ];
  return fields
    .filter(([, field]) => Boolean(evaluation.profileSnapshot[field]))
    .slice(0, 4)
    .map(([label, field]) => ({ label, value: getProfileValue(evaluation.profileSnapshot, field) }));
}

function Understanding({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.04] p-4"><div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-2 text-sm font-semibold leading-5">{value}</div></div>;
}

function BenefitPanel({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone: "success" | "warning" }) {
  const color = tone === "success" ? "var(--vm-color-success)" : "var(--vm-color-warning)";
  return <div className="rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] p-5"><div className="text-sm font-bold" style={{ color }}>{title}</div>{items.length ? <ul className="mt-3 space-y-2 text-sm">{items.map((item) => <li key={item} className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />{item}</li>)}</ul> : <p className="mt-3 text-sm text-[color:var(--vm-color-ink-muted)]">{empty}</p>}</div>;
}

function ProjectRecommendations({
  matches,
  readyForAdvisor,
}: {
  matches: Array<{ project: HousingProject; match: ProjectMatch }>;
  readyForAdvisor: boolean;
}) {
  return (
    <section className="result-reveal result-reveal--3 mt-10">
      <div className="max-w-2xl">
        <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
          {readyForAdvisor ? "Viviendas recomendadas" : "Viviendas para orientar tu meta"}
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em]">
          {readyForAdvisor
            ? "Opciones que responden a lo que nos contaste."
            : "Referencias para saber hacia dónde estás avanzando."}
        </h2>
        <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
          {readyForAdvisor
            ? "Mostramos máximo tres coincidencias y explicamos cada una."
            : PROJECT_REFERENCE_NOTICE}{" "}
          {PROJECT_VALIDITY_NOTICE}
        </p>
      </div>
      <div className="mt-7 grid gap-6 md:grid-cols-2">
        {matches.map(({ project, match }) => (
          <ProspectProject key={project.id} project={project} match={match} />
        ))}
      </div>
    </section>
  );
}

function PreparationPlan({
  evaluation,
  capacityDisplay,
  authoritative,
}: {
  evaluation: EvaluationResult;
  capacityDisplay: string;
  authoritative?: CanonicalJourneyResponse;
}) {
  const plan = authoritative?.nurture_plan;
  const actions =
    plan?.milestones.map(({ label }) => label) ??
    preparationActions(evaluation.route);
  return (
    <section
      id="plan-preparacion"
      className="orientation-section result-reveal result-reveal--3 mt-8 scroll-mt-6 overflow-hidden p-6 sm:p-8"
    >
      <div className="max-w-2xl">
        <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-warning)]">
          Tu plan de preparación
        </div>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-.035em]">
          No es un rechazo: es una ruta para avanzar.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
          Partimos de una brecha concreta y te mostramos qué fortalecer antes de una nueva revisión.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <PreparationStep
          label="Qué necesitamos fortalecer"
          value={
            plan?.primary_gap ??
            authoritative?.readiness.blockers[0] ??
            evaluation.blockers[0] ??
            "Completar información para orientar el siguiente paso."
          }
        />
        <PreparationStep
          label="Meta para avanzar"
          value={
            plan?.target_amount
              ? `Construir una meta aproximada de ${formatCop(plan.target_amount)}.`
              : preparationGoal(evaluation)
          }
        />
        <PreparationStep label="Cuota mensual de referencia" value={capacityDisplay} />
        <PreparationStep
          label="Cuándo revisamos nuevamente"
          value={
            plan?.review_date
              ? formatFollowUp(plan.review_date)
              : formatFollowUp(evaluation.followUpAt)
          }
        />
      </div>

      <div className="mt-6 rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-brand-blue)]/15 bg-[color:var(--vm-color-brand-blue)]/[.035] p-5 sm:p-6">
        <div className="text-xs font-bold uppercase tracking-[.09em] text-[color:var(--vm-color-brand-blue)]">
          Tus próximos pasos
        </div>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {actions.map((action, index) => (
            <li key={action} className="flex gap-3 rounded-[var(--vm-radius-control)] bg-white p-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] text-xs font-bold text-white">
                {index + 1}
              </span>
              <span className="text-sm font-semibold leading-6">{action}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
          Cuando llegue la fecha de revisión, se deberá actualizar esta información antes de decidir si corresponde atención comercial.
        </p>
      </div>
    </section>
  );
}

function ProspectProject({ project, match }: { project: HousingProject; match: ProjectMatch }) {
  const priceSource = getProjectEvidence(project, project.priceFromCop)[0];
  const availableTours = project.tours.filter(({ availability }) => availability === "AVAILABLE");
  return (
    <article className="orientation-project-card surface-solid overflow-hidden">
      <div className="orientation-project-image relative h-56 overflow-hidden">
        <Image
          src={project.image}
          alt={`Proyecto residencial ${project.name} de Colsubsidio`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition duration-500 hover:scale-[1.025]"
        />
        <div className="absolute inset-x-5 bottom-5 z-10 flex items-end justify-between gap-4 text-white">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.1em] text-white/80">
              {project.location.city} · {project.location.department}
            </div>
            <h3 className="mt-1 text-2xl font-semibold tracking-[-.035em]">
              {project.name}
            </h3>
          </div>
          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[color:var(--vm-color-brand-blue)]">
            Recomendado
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="block text-xs text-[color:var(--vm-color-ink-muted)]">
              Precio desde
            </span>
            <strong>
              {project.priceFromCop.validity === "CURRENT"
                ? formatProjectPrice(project)
                : "Por confirmar"}
            </strong>
          </div>
          <div>
            <span className="block text-xs text-[color:var(--vm-color-ink-muted)]">
              Área construida
            </span>
            <strong>{formatProjectAreaRange(project)}</strong>
          </div>
          <div>
            <span className="block text-xs text-[color:var(--vm-color-ink-muted)]">
              Inventario
            </span>
            <strong>Por confirmar</strong>
          </div>
          <div>
            <span className="block text-xs text-[color:var(--vm-color-ink-muted)]">
              Entrega
            </span>
            <strong>
              {project.deliveryDate.validity === "CURRENT" &&
              project.deliveryDate.value
                ? project.deliveryDate.value
                : "Por confirmar"}
            </strong>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
          {priceSource?.title ?? "Información oficial del proyecto"} · verificado{" "}
          {formatVerificationDate(project.priceFromCop.verifiedAt)}.
        </p>
        <div className="mt-5 text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-success)]">
          Por qué te lo mostramos
        </div>
        <ul className="mt-2 space-y-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
          {match.reasons.map((reason) => (
            <li key={reason} className="flex gap-2">
              <Icon
                name="check"
                className="mt-1 h-4 w-4 shrink-0 text-[color:var(--vm-color-success)]"
              />
              {reason}
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-[color:var(--vm-color-line)] pt-5">
          <div className="grid gap-2 sm:grid-cols-2">
            {project.brochureUrl ? (
              <a
                href={project.brochureUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-between gap-2 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] px-3 text-xs font-semibold text-[color:var(--vm-color-brand-blue)]"
              >
                Ver folleto del proyecto
                <Icon name="arrow" className="h-3.5 w-3.5" />
              </a>
            ) : null}
            {availableTours.map((tour) => (
              <a
                key={tour.id}
                href={tour.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-between gap-2 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] px-3 text-xs font-semibold text-[color:var(--vm-color-brand-blue)]"
              >
                {tour.label}
                <Icon name="arrow" className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
        <Link
          href={`/vivienda/proyectos/${project.id}`}
          className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[color:var(--vm-color-brand-blue)]"
        >
          Conocer el proyecto
          <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function PreparationStep({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] p-5"><div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">{label}</div><p className="mt-3 text-sm font-semibold leading-6">{value}</p></div>;
}

function preparationTitle(route: EvaluationResult["route"]): string {
  if (route === "NURTURE_FINANCIAL") return "Tu mejor paso ahora es fortalecer la cuota inicial.";
  if (route === "NURTURE_BENEFITS") return "Primero conviene revisar los beneficios disponibles.";
  if (route === "NURTURE_LONG_TERM") return "Puedes prepararte a tu ritmo desde hoy.";
  return "Completemos tu punto de partida antes de avanzar.";
}

function preparationGoal(evaluation: EvaluationResult): string {
  if (evaluation.route === "NURTURE_FINANCIAL") return "Construir una base de ahorro para la cuota inicial.";
  return evaluation.advanceCondition;
}

function formatFollowUp(value: string | null): string {
  if (!value) return "Cuando decidas retomar tu orientación.";
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" }).format(new Date(value));
}

function publicNextAction(route: EvaluationResult["route"]): string {
  const labels: Record<string, string> = {
    ADVISOR_NOW: "Solicitar contacto para validar financiación y disponibilidad.",
    NON_AFFILIATE_PRIORITY: "Solicitar orientación sobre la ruta disponible para ti.",
    NURTURE_FINANCIAL: "Definir un aporte mensual y comenzar tu ahorro.",
    NURTURE_BENEFITS: "Revisar qué beneficios podrían aplicar a tu caso.",
    NURTURE_LONG_TERM: "Guardar esta orientación y revisar tu avance más adelante.",
    NEEDS_DATA: "Completar la información necesaria para estimar tu capacidad.",
  };
  return labels[route] ?? "Revisa tu orientación y elige cuándo continuar.";
}

function preparationActions(route: EvaluationResult["route"]): string[] {
  const actions: Partial<Record<EvaluationResult["route"], string[]>> = {
    NURTURE_FINANCIAL: [
      "Define un aporte mensual realista para tu cuota inicial.",
      "Completa un primer periodo de ahorro y registra el avance.",
      "Revisa beneficios que podrían complementar ese ahorro.",
    ],
    NURTURE_BENEFITS: [
      "Revisa los requisitos del beneficio que deseas validar.",
      "Prepara la información y los soportes necesarios.",
      "Actualiza el resultado antes de solicitar contacto comercial.",
    ],
    NURTURE_LONG_TERM: [
      "Define una fecha objetivo para tu compra.",
      "Mantén una meta de ahorro acorde con ese horizonte.",
      "Retoma la orientación cuando falten menos de doce meses.",
    ],
    NEEDS_DATA: [
      "Completa los ingresos y obligaciones del hogar.",
      "Actualiza el ahorro y la composición de tu hogar.",
      "Realiza una nueva orientación con los datos confirmados.",
    ],
  };
  return (
    actions[route] ?? [
      publicNextAction(route),
      "Conserva actualizada tu información.",
      "Revisa nuevamente tu orientación antes de avanzar.",
    ]
  );
}

function ResultState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="orientation-experience">
      <OrientationHeader status="Orientación" />
      <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-[980px] place-items-center gap-8 px-5 py-10 lg:grid-cols-[.8fr_1.2fr]">
        <div className="hidden w-full lg:block">
          <HousingWindow compact />
        </div>
        <section className="orientation-result-hero max-w-lg p-8 text-center sm:p-10">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]">
            <Icon name="home" />
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-.04em]">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
            {description}
          </p>
          {action ? (
            <Link
              href={action.href}
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white"
            >
              {action.label}
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          ) : null}
        </section>
      </main>
    </div>
  );
}
