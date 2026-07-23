"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { ProjectCard } from "@/components/project-card";
import { PublicHeader } from "@/components/public-header";
import { projects } from "@/lib/data";
import type { ConversationSession } from "../domain";
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

  if (!loaded) {
    return <ResultState title="Preparando tu orientación…" description="Estamos recuperando la evaluación guardada en este navegador." />;
  }

  if (!session) {
    return <ResultState title="No encontramos este resultado." description="Los resultados de DEMO_MODE solo están disponibles en el navegador donde se completó la conversación." action={{ label: "Iniciar orientación", href: "/demo" }} />;
  }

  if (session.status === "ACTIVE" || !session.evaluation) {
    return <ResultState title="Tu conversación aún está en curso." description="Continúa las preguntas para construir una orientación completa." action={{ label: "Continuar conversación", href: `/conversacion/${session.id}` }} />;
  }

  const result = session.evaluation;
  const copy = getResultPresentation(result.route);
  const matchedProjects = projects.filter((project) => result.projectIds.includes(project.id));
  const confidenceLabel = result.confidenceScore >= 0.8 ? "Alta" : result.confidenceScore >= 0.65 ? "Media" : "Inicial";

  return (
    <div className="public-experience min-h-screen bg-[color:var(--vm-color-canvas)]">
      <PublicHeader />
      <main className="mx-auto max-w-[1120px] px-5 py-10 sm:px-8 lg:py-14">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-[color:var(--vm-color-brand-yellow)]/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-warning)]">DEMO_MODE · resultado orientativo</span>
          <Link href="/demo" className="text-sm font-semibold text-[color:var(--vm-color-brand-blue)]">Iniciar otra orientación</Link>
        </div>

        <section className="glass-elevated relative overflow-hidden p-6 sm:p-9 lg:p-12">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-[.11em] text-[color:var(--vm-color-success)]">{copy.eyebrow}</div>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-.05em] sm:text-5xl">{copy.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--vm-color-ink-muted)]">{copy.description}</p>
            {copy.actionHref ? (
              <Link href={copy.actionHref} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white transition hover:bg-[color:var(--vm-color-brand-blue-deep)]">
                {copy.actionLabel} <Icon name="arrow" className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3" aria-label="Resumen de orientación">
          <article className="surface-solid p-6">
            <div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Tu momento</div>
            <h2 className="mt-3 text-xl font-semibold">{copy.readinessLabel}</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Es una estimación orientativa, no una aprobación financiera.</p>
          </article>
          <article className="surface-solid p-6">
            <div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Certeza de la orientación</div>
            <h2 className="mt-3 text-xl font-semibold">{confidenceLabel}</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Depende de la cantidad y consistencia de la información disponible.</p>
          </article>
          <article className="surface-solid p-6">
            <div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Siguiente paso</div>
            <h2 className="mt-3 text-xl font-semibold">{result.nextAction}</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Una recomendación concreta para continuar a tu ritmo.</p>
          </article>
        </section>

        <section className="surface-solid mt-6 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-[-.035em]">Qué tuvimos en cuenta</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {result.factors.map((factor) => (
              <div key={factor} className="flex items-center gap-3 rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.04] p-4 text-sm font-semibold">
                <Icon name="check" className="h-4 w-4 shrink-0 text-[color:var(--vm-color-success)]" /> {factor}
              </div>
            ))}
          </div>
          {result.blockers.length ? (
            <div className="mt-6 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-brand-yellow)] bg-[color:var(--vm-color-brand-yellow)]/10 p-5">
              <div className="text-sm font-bold">Aspectos por fortalecer o validar</div>
              <ul className="mt-2 space-y-1 text-sm text-[color:var(--vm-color-ink-muted)]">
                {result.blockers.map((blocker) => <li key={blocker}>• {blocker}</li>)}
              </ul>
            </div>
          ) : null}
        </section>

        {matchedProjects.length ? (
          <section className="mt-10">
            <div className="max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Compatibilidad preliminar</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Un proyecto coincide con lo que nos contaste.</h2>
              <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Mostramos únicamente proyectos presentes en el catálogo vigente. Disponibilidad y beneficios deben confirmarse.</p>
            </div>
            <div className="mt-6 grid max-w-xl gap-5">
              {matchedProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
          </section>
        ) : (
          <section className="surface-solid mt-6 p-6 sm:p-8">
            <h2 className="text-xl font-semibold">Todavía no mostraremos un proyecto.</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Preferimos darte un siguiente paso claro antes que completar esta orientación con opciones que no estén suficientemente respaldadas.</p>
          </section>
        )}
      </main>
    </div>
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
    <div className="public-experience grid min-h-screen place-items-center bg-[color:var(--vm-color-canvas)] px-5">
      <section className="surface-solid max-w-lg p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]"><Icon name="sparkles" /></span>
        <h1 className="mt-5 text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{description}</p>
        {action ? <Link href={action.href} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white">{action.label} <Icon name="arrow" className="h-4 w-4" /></Link> : null}
      </section>
    </div>
  );
}
