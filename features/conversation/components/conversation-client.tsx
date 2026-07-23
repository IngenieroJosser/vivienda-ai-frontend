"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { PublicHeader } from "@/components/public-header";
import type { ConversationSession } from "../domain";
import { allQuestions } from "../questions";
import { getScenario } from "../scenarios";
import { answerCurrentQuestion, getCurrentQuestion } from "../session";
import { loadSession, saveSession } from "../storage";

export function ConversationClient({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<ConversationSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSession(loadSession(sessionId) ?? null);
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [sessionId]);

  const scenario = session ? getScenario(session.scenarioId) : undefined;
  const question = session ? getCurrentQuestion(session, allQuestions) : undefined;
  const progress = useMemo(() => {
    if (!session || session.questionIds.length === 0) return 0;
    return Math.round((session.currentQuestionIndex / session.questionIds.length) * 100);
  }, [session]);

  function chooseAnswer(value: string) {
    if (!session || !scenario || !question) return;
    setIsAdvancing(true);

    const updated = answerCurrentQuestion(session, scenario, value, new Date().toISOString());
    saveSession(updated);
    setSession(updated);

    if (updated.status !== "ACTIVE") {
      router.push(`/resultado/${updated.leadId}`);
      return;
    }

    window.setTimeout(() => setIsAdvancing(false), 180);
  }

  if (!loaded) {
    return <ConversationState title="Recuperando tu conversación…" description="Estamos leyendo la sesión guardada en este navegador." />;
  }

  if (!session || !scenario) {
    return <ConversationState title="No encontramos esta sesión." description="Puede haber sido creada en otro navegador o haberse eliminado." action={{ label: "Crear una sesión nueva", href: "/demo" }} />;
  }

  if (session.status !== "ACTIVE") {
    return <ConversationState title="Esta conversación ya finalizó." description="Tu orientación está lista y puedes volver a consultarla." action={{ label: "Ver mi resultado", href: `/resultado/${session.leadId}` }} />;
  }

  if (!question) {
    return <ConversationState title="No pudimos cargar la siguiente pregunta." description="La sesión sigue guardada. Vuelve a la demo e inténtalo nuevamente." action={{ label: "Volver a la demo", href: "/demo" }} />;
  }

  return (
    <div className="public-experience min-h-screen bg-[color:var(--vm-color-canvas)]">
      <PublicHeader />
      <main className="mx-auto max-w-[1080px] px-5 py-8 sm:px-8 lg:py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/demo" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--vm-color-brand-blue)]/15 bg-white px-4 text-sm font-semibold text-[color:var(--vm-color-brand-blue)]">
            <Icon name="arrow" className="h-4 w-4 rotate-180" /> Guardar y salir
          </Link>
          <span className="rounded-full bg-[color:var(--vm-color-brand-yellow)]/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-warning)]">DEMO_MODE · datos sintéticos</span>
        </div>

        <section className="glass-elevated overflow-hidden p-5 sm:p-8 lg:p-10" aria-labelledby="conversation-title">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Orientación de {scenario.displayName}</div>
              <h1 id="conversation-title" className="mt-2 text-2xl font-semibold tracking-[-.035em] sm:text-3xl">Conversemos sobre lo que necesitas.</h1>
            </div>
            <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] text-white sm:grid"><Icon name="sparkles" className="h-5 w-5" /></span>
          </div>

          <div className="mt-7">
            <div className="mb-2 flex justify-between text-xs font-semibold text-[color:var(--vm-color-ink-muted)]">
              <span>{question.id === "consent" ? "Consentimiento" : `Pregunta ${session.currentQuestionIndex + 1} de ${session.questionIds.length}`}</span>
              <span>{question.id === "consent" ? "Antes de comenzar" : `${progress}%`}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[color:var(--vm-color-brand-blue)]/10">
              <div className="h-full rounded-full bg-gradient-to-r from-[color:var(--vm-color-brand-yellow)] to-[color:var(--vm-color-brand-blue)] transition-[width] duration-300" style={{ width: question.id === "consent" ? "8%" : `${Math.max(12, progress)}%` }} />
            </div>
          </div>

          <div key={question.id} className="mt-8 rounded-[var(--vm-radius-card)] bg-[color:var(--vm-color-surface)] p-5 shadow-[var(--vm-shadow-low)] sm:p-7">
            <div className="flex items-start gap-3">
              <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]"><Icon name="sparkles" className="h-4 w-4" /></span>
              <div>
                <h2 className="text-xl font-semibold leading-tight tracking-[-.025em] sm:text-2xl">{question.prompt}</h2>
                {question.explanation ? <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{question.explanation}</p> : null}
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => chooseAnswer(option.value)}
                  disabled={isAdvancing}
                  className="group flex min-h-14 w-full items-center justify-between gap-4 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-brand-blue)]/15 bg-white px-4 py-3 text-left text-sm font-semibold transition hover:border-[color:var(--vm-color-brand-blue)] hover:bg-[color:var(--vm-color-brand-blue)]/[.04] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] disabled:opacity-[var(--vm-opacity-disabled)] sm:px-5 sm:text-base"
                >
                  <span>{option.label}</span>
                  <Icon name="arrow" className="h-4 w-4 shrink-0 text-[color:var(--vm-color-brand-blue)] transition group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">Tus avances se guardan automáticamente en este dispositivo.</p>
        </section>
      </main>
    </div>
  );
}

function ConversationState({
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
