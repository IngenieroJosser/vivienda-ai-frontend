"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import type { ConversationSession, ProfileField } from "../domain";
import { getAnswerLabel, getKnownDataMessage } from "../profile-copy";
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
  const answeredQuestionIds = useMemo(
    () => session?.questionIds.slice(0, session.currentQuestionIndex) ?? [],
    [session],
  );
  const progress = session?.consent === "PENDING"
    ? 0
    : Math.round(((session?.currentQuestionIndex ?? 0) / Math.max(1, session?.questionIds.length ?? 1)) * 100);

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

  if (!loaded) return <ConversationState title="Recuperando la conversación…" description="Estamos leyendo el avance guardado en este navegador." />;
  if (!session || !scenario) return <ConversationState title="No encontramos esta sesión." description="Puede haber sido creada en otro navegador o haberse eliminado." action={{ label: "Volver al simulador", href: "/demo" }} />;
  if (session.status !== "ACTIVE") return <ConversationState title="El perfilamiento ya finalizó." description="La recomendación inteligente está disponible." action={{ label: "Ver resultado", href: `/resultado/${session.leadId}` }} />;
  if (!question) return <ConversationState title="No pudimos cargar la siguiente pregunta." description="La sesión continúa guardada." action={{ label: "Volver al simulador", href: "/demo" }} />;

  return (
    <div className="min-h-screen bg-[linear-gradient(145deg,#f5fbff_0%,#fffdf3_52%,#f7fbfd_100%)] text-[color:var(--vm-color-ink)]">
      <header className="border-b border-[color:var(--vm-color-line)] bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-[920px] items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] text-white"><Icon name="sparkles" className="h-5 w-5" /></span>
            <div>
              <div className="text-sm font-bold">Asesor digital de vivienda</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[color:var(--vm-color-success)]"><span className="h-2 w-2 rounded-full bg-[color:var(--vm-color-success)]" /> Canal WhatsApp simulado</div>
            </div>
          </div>
          <Link href="/demo" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--vm-color-brand-blue)]/15 px-4 text-sm font-semibold text-[color:var(--vm-color-brand-blue)]">
            <Icon name="arrow" className="h-4 w-4 rotate-180" /> <span className="hidden sm:inline">Guardar y salir</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[920px] px-4 py-5 sm:px-8 sm:py-8">
        <div className="mb-4 flex items-center justify-between gap-3 px-1">
          <span className="text-xs font-semibold text-[color:var(--vm-color-ink-muted)]">
            {session.consent === "PENDING" ? "Antes de conversar" : `Perfilamiento ${progress}% completo`}
          </span>
          <span className="rounded-full bg-[color:var(--vm-color-brand-yellow)]/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-warning)]">DEMO_MODE</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--vm-color-brand-blue)]/10">
          <div className="h-full rounded-full bg-[color:var(--vm-color-brand-blue)] transition-[width] duration-200" style={{ width: `${Math.max(session.consent === "PENDING" ? 4 : 12, progress)}%` }} />
        </div>

        <section className="mt-5 min-h-[560px] rounded-[var(--vm-radius-elevated)] border border-[color:var(--vm-color-line)] bg-[#f8fcff] p-4 shadow-[var(--vm-shadow-low)] sm:p-7" aria-label="Conversación de perfilamiento">
          <div className="mx-auto max-w-[720px] space-y-4">
            <AssistantMessage>
              Hola, {scenario.displayName}. Sabemos que te interesa adquirir vivienda y queremos ayudarte a encontrar el mejor camino según tus necesidades.
            </AssistantMessage>

            {session.consent === "PENDING" ? (
              <AssistantMessage>
                Antes de usar la información sintética asociada a este escenario, necesitamos tu autorización. También puedes comenzar desde cero.
              </AssistantMessage>
            ) : (
              <AssistantMessage>
                {session.consent === "USE_KNOWN_DATA"
                  ? getKnownDataMessage(scenario)
                  : "Perfecto. Empezaremos desde cero y solo usaremos lo que nos cuentes en esta conversación."}
              </AssistantMessage>
            )}

            {answeredQuestionIds.map((questionId) => {
              if (questionId === "consent") return null;
              const answeredQuestion = allQuestions[questionId];
              const answer = session.answers[questionId as ProfileField];
              if (!answer) return null;
              return (
                <div key={questionId} className="space-y-3">
                  <AssistantMessage>{answeredQuestion.prompt}</AssistantMessage>
                  <UserMessage>{getAnswerLabel(questionId as ProfileField, answer)}</UserMessage>
                </div>
              );
            })}

            <div key={question.id} className="space-y-3 pt-1" aria-live="polite">
              <AssistantMessage>
                <span className="text-base font-semibold">{question.prompt}</span>
                {question.explanation ? <span className="mt-2 block text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">{question.explanation}</span> : null}
              </AssistantMessage>
              <div className="ml-0 grid gap-2.5 sm:ml-12 sm:max-w-[620px]">
                {question.options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => chooseAnswer(option.value)}
                    disabled={isAdvancing}
                    className="group flex min-h-12 items-center justify-between gap-3 rounded-[18px] border border-[color:var(--vm-color-brand-blue)]/18 bg-white px-4 py-3 text-left text-sm font-semibold shadow-sm transition hover:border-[color:var(--vm-color-brand-blue)] hover:bg-[color:var(--vm-color-brand-blue)]/[.04] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] disabled:opacity-[var(--vm-opacity-disabled)]"
                  >
                    {option.label}
                    <Icon name="arrow" className="h-4 w-4 shrink-0 text-[color:var(--vm-color-brand-blue)] transition group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
        <p className="mt-4 text-center text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">Máximo seis decisiones · Avance guardado en este dispositivo · Sin aprobación automática de crédito o subsidios</p>
      </main>
    </div>
  );
}

function AssistantMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-end gap-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] text-white"><Icon name="sparkles" className="h-3.5 w-3.5" /></span>
      <div className="max-w-[620px] rounded-[20px_20px_20px_6px] bg-white px-4 py-3 text-sm leading-6 shadow-sm">{children}</div>
    </div>
  );
}

function UserMessage({ children }: { children: React.ReactNode }) {
  return <div className="ml-auto max-w-[560px] rounded-[20px_20px_6px_20px] bg-[color:var(--vm-color-brand-blue)] px-4 py-3 text-sm font-semibold leading-6 text-white">{children}</div>;
}

function ConversationState({ title, description, action }: { title: string; description: string; action?: { label: string; href: string } }) {
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
