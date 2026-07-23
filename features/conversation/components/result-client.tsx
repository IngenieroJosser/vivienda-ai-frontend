"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { ProjectCard } from "@/components/project-card";
import { PublicHeader } from "@/components/public-header";
import { projects } from "@/lib/data";
import type { ConversationSession } from "../domain";
import { formatCop } from "../profile-copy";
import { getResultPresentation } from "../presentation";
import { findSessionByLeadId } from "../storage";

export function ResultClient({ leadId }: { leadId: string }) {
  const [session, setSession] = useState<ConversationSession | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSession(findSessionByLeadId(leadId) ?? null);
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [leadId]);

  if (!loaded) return <ResultState title="Preparando tu orientación…" description="Estamos organizando la recomendación a partir de tus respuestas." />;
  if (!session) return <ResultState title="No encontramos este resultado." description="Los resultados de DEMO_MODE solo están disponibles en el navegador donde se completó la conversación." action={{ label: "Iniciar perfilamiento", href: "/demo" }} />;
  if (session.status === "ACTIVE" || !session.evaluation) return <ResultState title="Tu conversación aún está en curso." description="Completa el perfilamiento para conocer el siguiente paso." action={{ label: "Continuar conversación", href: `/conversacion/${session.id}` }} />;

  const result = session.evaluation;
  const copy = getResultPresentation(result.route);
  const matchedProjects = projects.filter((project) => result.projectIds.includes(project.id));
  const hasCapacity = result.capacity.estimatedHousingPayment > 0;

  return (
    <div className="public-experience min-h-screen bg-[color:var(--vm-color-canvas)]">
      <PublicHeader />
      <main className="mx-auto max-w-[1120px] px-5 py-9 sm:px-8 lg:py-14">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-[color:var(--vm-color-brand-yellow)]/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-warning)]">DEMO_MODE · orientación, no aprobación</span>
          <Link href={`/asesor/leads/${leadId}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--vm-color-brand-blue)]/20 bg-white px-4 text-sm font-semibold text-[color:var(--vm-color-brand-blue)]">
            Ver lo que recibe el asesor <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>

        <section className="glass-elevated overflow-hidden p-6 sm:p-9 lg:p-12">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-[.11em] text-[color:var(--vm-color-success)]">{copy.eyebrow}</div>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-.05em] sm:text-5xl">{copy.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--vm-color-ink-muted)]">{copy.description}</p>
            {copy.actionHref ? <Link href={copy.actionHref} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white">{copy.actionLabel}<Icon name="arrow" className="h-4 w-4" /></Link> : null}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_.9fr]" aria-label="Capacidad y siguiente paso">
          <article className="surface-solid p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]"><Icon name="money" /></span>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Capacidad preliminar</div>
                <h2 className="mt-1 text-2xl font-semibold">{hasCapacity ? `Hasta ${formatCop(result.capacity.estimatedHousingPayment)} al mes` : "Pendiente de completar"}</h2>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">La estimación reserva como máximo el 40 % del ingreso para obligaciones actuales y una futura cuota de vivienda. No constituye aprobación de crédito.</p>
            {hasCapacity ? (
              <div className="mt-5 rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.04] p-4 text-sm">
                <div className="flex justify-between gap-4"><span>Obligaciones estimadas</span><strong>{Math.round(result.capacity.currentCommitmentRatio * 100)} %</strong></div>
                <div className="mt-2 flex justify-between gap-4"><span>Margen máximo para vivienda</span><strong>{Math.round(result.capacity.maximumHousingRatio * 100)} %</strong></div>
              </div>
            ) : null}
          </article>

          <article className="surface-solid p-6 sm:p-8">
            <div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Tu siguiente paso</div>
            <h2 className="mt-3 text-2xl font-semibold leading-tight">{result.nextAction}</h2>
            <p className="mt-4 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{copy.readinessLabel}. Avanzaremos según tu momento, sin enviarte a una conversación de cierre antes de tiempo.</p>
          </article>
        </section>

        <section className="surface-solid mt-6 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Beneficios: confirmados y por validar</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Nunca presentaremos un beneficio potencial como si ya estuviera aprobado.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <BenefitBlock title="Confirmados" items={result.benefitSignals.confirmed} empty="Ningún beneficio confirmado todavía." tone="success" />
            <BenefitBlock title="Podrían aplicar" items={result.benefitSignals.potential} empty="No identificamos beneficios potenciales con la información disponible." tone="warning" />
          </div>
        </section>

        {matchedProjects.length ? (
          <section className="mt-9">
            <div className="max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Compatibilidad preliminar</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Encontramos una opción para conversar.</h2>
              <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Solo mostramos proyectos respaldados por el catálogo vigente; disponibilidad, financiación y beneficios deben verificarse.</p>
            </div>
            <div className="mt-6 grid max-w-xl gap-5">{matchedProjects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
          </section>
        ) : (
          <section className="surface-solid mt-6 p-6 sm:p-8">
            <h2 className="text-xl font-semibold">Todavía no recomendamos un proyecto.</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Primero construiremos el paso de preparación o validaremos la información que falta. No completaremos el resultado con opciones simuladas.</p>
          </section>
        )}
      </main>
    </div>
  );
}

function BenefitBlock({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone: "success" | "warning" }) {
  const color = tone === "success" ? "var(--vm-color-success)" : "var(--vm-color-warning)";
  return (
    <div className="rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] p-5">
      <div className="text-sm font-bold" style={{ color }}>{title}</div>
      {items.length ? <ul className="mt-3 space-y-2 text-sm">{items.map((item) => <li key={item} className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />{item}</li>)}</ul> : <p className="mt-3 text-sm text-[color:var(--vm-color-ink-muted)]">{empty}</p>}
    </div>
  );
}

function ResultState({ title, description, action }: { title: string; description: string; action?: { label: string; href: string } }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[color:var(--vm-color-canvas)] px-5">
      <section className="surface-solid max-w-lg p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]"><Icon name="sparkles" /></span>
        <h1 className="mt-5 text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{description}</p>
        {action ? <Link href={action.href} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white">{action.label}<Icon name="arrow" className="h-4 w-4" /></Link> : null}
      </section>
    </div>
  );
}
