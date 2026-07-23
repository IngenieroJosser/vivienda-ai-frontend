"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
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
import type { ProspectSession } from "../domain";
import { getCapacityRange } from "../capacity";
import { loadProspectSession } from "../storage";

export function ProspectResult({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<ProspectSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadProspectSession(sessionId) ?? null;
      setSession(stored);
      setLoaded(true);
      if (stored?.evaluation) {
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
    if (!loaded || !session?.evaluation || session.status !== "COMPLETED") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setShowResult(true), reduceMotion ? 0 : 480);
    return () => window.clearTimeout(timer);
  }, [loaded, session]);

  if (!loaded) return <ResultState title="Preparando tu orientación…" description="Estamos organizando lo que entendimos y el siguiente paso." />;
  if (!session) return <ResultState title="No encontramos esta orientación." description="El resultado está disponible en el dispositivo donde completaste la conversación." action={{ label: "Empezar orientación", href: "/orientacion" }} />;
  if (session.status !== "COMPLETED" || !session.evaluation) return <ResultState title="La conversación todavía no ha terminado." description="Continúa conversando para que podamos comprender tu situación y darte una orientación responsable." action={{ label: "Continuar", href: `/orientacion/${session.id}` }} />;
  if (!showResult) return <ResultTransition />;

  const evaluation = session.evaluation;
  const capacityRange = getCapacityRange(evaluation.capacity.estimatedHousingPayment);
  const matchedProjects = resolveProjectMatches(evaluation.projectMatches);
  const readyForAdvisor = evaluation.route === "ADVISOR_NOW" || evaluation.route === "NON_AFFILIATE_PRIORITY";
  const actionHref = readyForAdvisor
    ? `/vivienda/agendar?from=orientacion&sessionId=${encodeURIComponent(session.id)}`
    : "#plan-preparacion";
  const actionLabel = readyForAdvisor ? "Continuar con un asesor" : "Ver mi plan de preparación";
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
    <div className="min-h-screen bg-[color:var(--vm-color-canvas)] text-[color:var(--vm-color-ink)]">
      <header className="border-b border-[color:var(--vm-color-line)] bg-white">
        <div className="mx-auto flex min-h-[64px] max-w-[980px] items-center justify-between px-5 sm:px-8">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[color:var(--vm-color-brand-blue)]"><Icon name="home" className="h-4 w-4" /> Vivienda Colsubsidio</div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--vm-color-success)]"><Icon name="check" className="h-4 w-4" /> Orientación lista</span>
        </div>
      </header>

      <main className="mx-auto max-w-[980px] px-5 py-8 sm:px-8 lg:py-12">
        <section className="result-reveal result-reveal--1 overflow-hidden border-b border-[color:var(--vm-color-line)] pb-8 sm:pb-10">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-success)]">
              {session.firstName ? `Tu orientación, ${session.firstName}` : "Tu orientación personalizada"}
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.04] tracking-[-.04em] sm:text-5xl">
              {readyForAdvisor ? "Tu perfil parece listo para avanzar." : preparationTitle(evaluation.route)}
            </h1>
            <p className="result-reveal result-reveal--2 mt-5 max-w-2xl text-base leading-7 text-[color:var(--vm-color-ink-muted)]">
              {capacityRange
                ? `Estimamos que podrías destinar entre ${formatCop(capacityRange.minimum)} y ${formatCop(capacityRange.maximum)} al mes para vivienda.`
                : "Todavía necesitamos fortalecer o completar información antes de estimar una cuota responsable."}
            </p>
            <p className="mt-4 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">El rango es orientativo y no constituye aprobación de crédito, subsidio o disponibilidad.</p>
          </div>
        </section>

        <section className="result-reveal result-reveal--2 mt-8 border-b border-[color:var(--vm-color-line)] pb-8 sm:pb-10">
          <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Lo que entendimos</div>
          <h2 className="mt-2 text-2xl font-semibold">Este es tu punto de partida.</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {profileSummary.map(({ label, value }) => <Understanding key={label} label={label} value={value} />)}
          </div>
        </section>

        <section className="result-reveal result-reveal--3 mt-8 border-b border-[color:var(--vm-color-line)] pb-8 sm:pb-10">
          <h2 className="text-2xl font-semibold">Beneficios con total claridad</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Separamos lo que ya está confirmado de aquello que todavía requiere una revisión.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <BenefitPanel title="Confirmados" items={evaluation.benefitSignals.confirmed} empty="No hay beneficios confirmados todavía." tone="success" />
            <BenefitPanel title="Podrías validar" items={evaluation.benefitSignals.potential} empty="Con la información actual no identificamos beneficios adicionales." tone="warning" />
          </div>
        </section>

        {matchedProjects.length ? (
          <section className="result-reveal result-reveal--3 mt-8">
            <div className="max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Proyectos para explorar</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em]">Opciones que responden a lo que nos contaste.</h2>
              <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Mostramos máximo tres coincidencias y explicamos cada una. Los datos sin vigencia aparecen como “por confirmar”.</p>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">{matchedProjects.map(({ project, match }) => <ProspectProject key={project.id} project={project} match={match} />)}</div>
          </section>
        ) : null}

        {!readyForAdvisor ? (
          <section id="plan-preparacion" className="result-reveal result-reveal--3 mt-8 scroll-mt-6 border-t border-[color:var(--vm-color-line)] pt-8">
            <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-warning)]">Tu plan de preparación</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-.035em]">Avanza con una meta concreta.</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <PreparationStep label="Meta" value={preparationGoal(evaluation)} />
              <PreparationStep label="Momento para revisar" value={formatFollowUp(evaluation.followUpAt)} />
              <PreparationStep label="Acción" value={publicNextAction(evaluation.route)} />
            </div>
          </section>
        ) : null}

        <section className="result-reveal result-reveal--4 mt-10 rounded-[var(--vm-radius-elevated)] bg-[linear-gradient(135deg,#fff7bd,#eef8ff)] p-7 shadow-[var(--vm-shadow-medium)] sm:flex sm:items-end sm:justify-between sm:gap-8 sm:p-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Tu siguiente acción</div>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-.04em]">{readyForAdvisor ? "Ya puedes continuar acompañado." : "Avanza a tu ritmo con una meta clara."}</h2>
          </div>
          <Link href={actionHref} onClick={trackAction} className="mt-6 inline-flex min-h-13 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[color:var(--vm-color-brand-blue-deep)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] sm:mt-0 sm:w-auto">
            {actionLabel}<Icon name="arrow" className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}

function ResultTransition() {
  return (
    <div className="grid min-h-screen place-items-center bg-[linear-gradient(145deg,#fffef8,#eef8ff)] px-5 text-[color:var(--vm-color-ink)]">
      <section className="result-transition text-center" role="status" aria-live="polite">
        <span className="mx-auto block h-2 w-2 rounded-full bg-[color:var(--vm-color-brand-yellow)]" />
        <h1 className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-4xl">
          Ya tenemos suficiente información para orientarte.
        </h1>
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
  return <div className="rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.04] p-4"><div className="text-[10px] font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-2 text-sm font-semibold leading-5">{value}</div></div>;
}

function BenefitPanel({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone: "success" | "warning" }) {
  const color = tone === "success" ? "var(--vm-color-success)" : "var(--vm-color-warning)";
  return <div className="rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] p-5"><div className="text-sm font-bold" style={{ color }}>{title}</div>{items.length ? <ul className="mt-3 space-y-2 text-sm">{items.map((item) => <li key={item} className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />{item}</li>)}</ul> : <p className="mt-3 text-sm text-[color:var(--vm-color-ink-muted)]">{empty}</p>}</div>;
}

function ProspectProject({ project, match }: { project: HousingProject; match: ProjectMatch }) {
  const priceSource = getProjectEvidence(project, project.priceFromCop)[0];
  const availableTours = project.tours.filter(({ availability }) => availability === "AVAILABLE");
  return (
    <article className="surface-solid overflow-hidden p-6">
      <div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">{project.location.city} · {project.location.department}</div>
      <h3 className="mt-2 text-2xl font-semibold">{project.name}</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div><span className="block text-xs text-[color:var(--vm-color-ink-muted)]">Precio desde</span><strong>{project.priceFromCop.validity === "CURRENT" ? formatProjectPrice(project) : "Por confirmar"}</strong></div>
        <div><span className="block text-xs text-[color:var(--vm-color-ink-muted)]">Área construida</span><strong>{formatProjectAreaRange(project)}</strong></div>
        <div><span className="block text-xs text-[color:var(--vm-color-ink-muted)]">Inventario</span><strong>Por confirmar</strong></div>
        <div><span className="block text-xs text-[color:var(--vm-color-ink-muted)]">Entrega</span><strong>{project.deliveryDate.validity === "CURRENT" && project.deliveryDate.value ? project.deliveryDate.value : "Por confirmar"}</strong></div>
      </div>
      <p className="mt-3 text-[10px] leading-4 text-[color:var(--vm-color-ink-muted)]">{priceSource?.title ?? "Material comercial aprobado"} · verificado {formatVerificationDate(project.priceFromCop.verifiedAt)}.</p>
      <div className="mt-5 text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-success)]">Por qué te lo mostramos</div>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
        {match.reasons.map((reason) => <li key={reason} className="flex gap-2"><Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-[color:var(--vm-color-success)]" />{reason}</li>)}
      </ul>
      <div className="mt-5 border-t border-[color:var(--vm-color-line)] pt-5">
        <div className="grid gap-2 sm:grid-cols-2">
          {project.brochureUrl ? <a href={project.brochureUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-between gap-2 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] px-3 text-xs font-semibold text-[color:var(--vm-color-brand-blue)]">Ver brochure aprobado<Icon name="arrow" className="h-3.5 w-3.5" /></a> : null}
          {availableTours.map((tour) => <a key={tour.id} href={tour.url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-between gap-2 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] px-3 text-xs font-semibold text-[color:var(--vm-color-brand-blue)]">{tour.label}<Icon name="arrow" className="h-3.5 w-3.5" /></a>)}
        </div>
      </div>
      <Link href={`/vivienda/proyectos/${project.id}`} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[color:var(--vm-color-brand-blue)]">Conocer el proyecto <Icon name="arrow" className="h-4 w-4" /></Link>
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

function ResultState({ title, description, action }: { title: string; description: string; action?: { label: string; href: string } }) {
  return <div className="grid min-h-screen place-items-center bg-[color:var(--vm-color-canvas)] px-5"><section className="surface-solid max-w-lg p-8 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]"><Icon name="home" /></span><h1 className="mt-5 text-2xl font-semibold">{title}</h1><p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{description}</p>{action ? <Link href={action.href} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white">{action.label}<Icon name="arrow" className="h-4 w-4" /></Link> : null}</section></div>;
}
