"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import type { EvaluationResult } from "@/features/conversation/domain";
import { getProfileValue, formatCop } from "@/features/conversation/profile-copy";
import { projects } from "@/lib/data";
import { createFunnelEvent, trackFunnelEvent } from "../analytics";
import { campaignExperiences } from "../campaigns";
import type { CampaignExperience, ProspectSession } from "../domain";
import { getCapacityRange } from "../engine";
import { loadProspectSession } from "../storage";

export function ProspectResult({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<ProspectSession | null>(null);
  const [loaded, setLoaded] = useState(false);

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

  if (!loaded) return <ResultState title="Preparando tu orientación…" description="Estamos organizando lo que entendimos y el siguiente paso." />;
  if (!session) return <ResultState title="No encontramos esta orientación." description="El resultado está disponible en el dispositivo donde completaste la conversación." action={{ label: "Empezar orientación", href: "/orientacion" }} />;
  if (session.status !== "COMPLETED" || !session.evaluation) return <ResultState title="La conversación todavía no ha terminado." description="Completa las preguntas para recibir una orientación responsable." action={{ label: "Continuar", href: `/orientacion/${session.id}` }} />;

  const evaluation = session.evaluation;
  const campaign = campaignExperiences[session.campaignId];
  const capacityRange = getCapacityRange(evaluation.capacity.estimatedHousingPayment);
  const matchedProjects = projects.filter((project) => evaluation.projectIds.includes(project.id)).slice(0, 3);
  const readyForAdvisor = evaluation.route === "ADVISOR_NOW" || evaluation.route === "NON_AFFILIATE_PRIORITY";
  const actionHref = readyForAdvisor
    ? `/vivienda/agendar?from=orientacion&sessionId=${encodeURIComponent(session.id)}`
    : "#ruta-preparacion";
  const actionLabel = readyForAdvisor ? "Agendar mi orientación" : "Ver mi ruta de preparación";

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
        <div className="mx-auto flex min-h-[68px] max-w-[1080px] items-center justify-between px-5 sm:px-8">
          <div className="text-sm font-bold text-[color:var(--vm-color-brand-blue)]">Colsubsidio × Vivienda Match AI</div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--vm-color-success)]"><Icon name="check" className="h-4 w-4" /> Orientación completada</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-5 py-9 sm:px-8 lg:py-14">
        <section className="glass-elevated p-6 sm:p-9 lg:p-12">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-success)]">Tu orientación, {session.firstName}</div>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.03] tracking-[-.05em] sm:text-5xl">{readyForAdvisor ? "Hay condiciones para dar el siguiente paso." : "Tu mejor paso ahora es prepararte con claridad."}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--vm-color-ink-muted)]">{readyForAdvisor ? "Encontramos señales favorables para conversar con un asesor y validar financiación, beneficios y disponibilidad." : "Todavía no conviene apresurar una conversación de cierre. Te mostramos qué fortalecer y cuándo revisar nuevamente."}</p>
            <Link href={actionHref} onClick={trackAction} className="mt-7 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white sm:w-auto">{actionLabel}<Icon name="arrow" className="h-4 w-4" /></Link>
          </div>
        </section>

        <section className="surface-solid mt-6 p-6 sm:p-8">
          <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Qué entendimos</div>
          <h2 className="mt-2 text-2xl font-semibold">Este es tu punto de partida.</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Understanding label="Momento de compra" value={getProfileValue(evaluation.profileSnapshot, "horizon")} />
            <Understanding label="Afiliación" value={getProfileValue(evaluation.profileSnapshot, "affiliation")} />
            <Understanding label="Estado de ahorro" value={getProfileValue(evaluation.profileSnapshot, "savings")} />
            <Understanding label="Interés de campaña" value={campaign.eyebrow} />
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_.9fr]">
          <article className="surface-solid p-6 sm:p-8">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]"><Icon name="money" /></span><div><div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Rango mensual orientativo</div><h2 className="mt-1 text-2xl font-semibold">{capacityRange ? `${formatCop(capacityRange.minimum)} – ${formatCop(capacityRange.maximum)}` : "Necesitamos más información"}</h2></div></div>
            <p className="mt-5 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Este rango reserva como máximo el 40 % del ingreso para obligaciones actuales y vivienda. Sirve para orientarte; no es una aprobación ni una cuota definitiva.</p>
          </article>

          <article className="surface-solid p-6 sm:p-8">
            <div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Siguiente paso recomendado</div>
            <h2 className="mt-3 text-2xl font-semibold leading-tight">{publicNextAction(evaluation.route)}</h2>
            <p className="mt-4 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">La recomendación parte de tu momento, margen financiero y ahorro declarado.</p>
          </article>
        </section>

        <section className="surface-solid mt-6 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Beneficios con total claridad</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <BenefitPanel title="Confirmados" items={evaluation.benefitSignals.confirmed} empty="No hay beneficios confirmados todavía." tone="success" />
            <BenefitPanel title="Por validar" items={evaluation.benefitSignals.potential} empty="Con la información actual no identificamos beneficios para validar." tone="warning" />
          </div>
        </section>

        {matchedProjects.length ? (
          <section className="mt-9">
            <div className="max-w-2xl"><div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Opciones compatibles</div><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Un proyecto para explorar, no una promesa.</h2><p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">La disponibilidad, financiación y beneficios siempre deben confirmarse.</p></div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{matchedProjects.map((project) => <ProspectProject key={project.id} project={project} campaign={campaign} />)}</div>
          </section>
        ) : null}

        {!readyForAdvisor ? (
          <section id="ruta-preparacion" className="surface-solid mt-8 scroll-mt-6 p-6 sm:p-8">
            <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-warning)]">Ruta de preparación</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-.04em]">Avanza por pasos alcanzables.</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ["1", evaluation.blockers[0] ?? "Completar la información pendiente"],
                ["2", evaluation.nextAction],
                ["3", evaluation.advanceCondition],
              ].map(([number, text]) => <div key={number} className="rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] p-5"><span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--vm-color-brand-yellow)]/25 text-sm font-bold text-[color:var(--vm-color-warning)]">{number}</span><p className="mt-4 text-sm font-semibold leading-6">{text}</p></div>)}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function Understanding({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.035] p-4"><div className="text-[10px] font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-2 text-sm font-semibold leading-5">{value}</div></div>;
}

function BenefitPanel({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone: "success" | "warning" }) {
  const color = tone === "success" ? "var(--vm-color-success)" : "var(--vm-color-warning)";
  return <div className="rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] p-5"><div className="text-sm font-bold" style={{ color }}>{title}</div>{items.length ? <ul className="mt-3 space-y-2 text-sm">{items.map((item) => <li key={item} className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />{item}</li>)}</ul> : <p className="mt-3 text-sm text-[color:var(--vm-color-ink-muted)]">{empty}</p>}</div>;
}

function ProspectProject({ project, campaign }: { project: (typeof projects)[number]; campaign: CampaignExperience }) {
  return <article className="surface-solid overflow-hidden p-6"><div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">{project.city} · {project.zone}</div><h3 className="mt-2 text-2xl font-semibold">{project.name}</h3><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><span className="block text-xs text-[color:var(--vm-color-ink-muted)]">Precio publicado</span><strong>{project.priceLabel}</strong></div><div><span className="block text-xs text-[color:var(--vm-color-ink-muted)]">Área</span><strong>{project.area}</strong></div></div><p className="mt-5 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{campaign.projectId === project.id ? "Llegaste desde una campaña de este proyecto y su ubicación coincide con el interés registrado." : "Coincide preliminarmente con la información de tu orientación."}</p><Link href={`/vivienda/proyectos/${project.id}`} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[color:var(--vm-color-brand-blue)]">Conocer el proyecto <Icon name="arrow" className="h-4 w-4" /></Link></article>;
}

function publicNextAction(route: EvaluationResult["route"]): string {
  const labels: Record<string, string> = {
    ADVISOR_NOW: "Agenda una conversación para validar financiación y disponibilidad.",
    NON_AFFILIATE_PRIORITY: "Habla con un asesor para conocer la ruta disponible para ti.",
    NURTURE_FINANCIAL: "Construye una meta de ahorro antes de avanzar a cierre.",
    NURTURE_BENEFITS: "Revisa primero los beneficios que podrían aplicar.",
    NURTURE_LONG_TERM: "Continúa preparándote y revisa tu avance más adelante.",
    NEEDS_DATA: "Completa la información necesaria para orientar tu capacidad.",
  };
  return labels[route] ?? "Revisa tu orientación y elige cuándo continuar.";
}

function ResultState({ title, description, action }: { title: string; description: string; action?: { label: string; href: string } }) {
  return <div className="grid min-h-screen place-items-center bg-[color:var(--vm-color-canvas)] px-5"><section className="surface-solid max-w-lg p-8 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]"><Icon name="sparkles" /></span><h1 className="mt-5 text-2xl font-semibold">{title}</h1><p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{description}</p>{action ? <Link href={action.href} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white">{action.label}<Icon name="arrow" className="h-4 w-4" /></Link> : null}</section></div>;
}
