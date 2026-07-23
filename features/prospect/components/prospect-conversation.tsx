"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { Icon } from "@/components/icon";
import { getAnswerLabel } from "@/features/conversation/profile-copy";
import { questionBank } from "@/features/conversation/questions";
import { createFunnelEvent, trackFunnelEvent } from "../analytics";
import { campaignExperiences } from "../campaigns";
import type { ProspectSession } from "../domain";
import { acceptProspectConsent, answerProspectQuestion, declineProspectConsent, MAX_PUBLIC_DECISIONS } from "../engine";
import { loadProspectSession, saveProspectSession } from "../storage";

export function ProspectConversation({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<ProspectSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSession(loadProspectSession(sessionId) ?? null);
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [sessionId]);

  const campaign = session ? campaignExperiences[session.campaignId] : undefined;
  const currentField = session?.questionIds[session.currentQuestionIndex];
  const answeredFields = useMemo(
    () => session?.questionIds.slice(0, session.currentQuestionIndex) ?? [],
    [session],
  );

  useEffect(() => {
    if (!session || session.status !== "ACTIVE" || !currentField) return;
    const handlePageHide = () => {
      if (completedRef.current) return;
      trackFunnelEvent(createFunnelEvent({
        name: "QUESTION_ABANDONED",
        acquisition: session.acquisition,
        sessionId: session.id,
        questionId: currentField,
        occurredAt: new Date().toISOString(),
      }));
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [currentField, session]);

  function acceptConsent() {
    if (!session) return;
    const updated = acceptProspectConsent(session, new Date().toISOString());
    saveProspectSession(updated);
    setSession(updated);
    trackFunnelEvent(createFunnelEvent({
      name: "CONSENT_ACCEPTED",
      acquisition: updated.acquisition,
      sessionId: updated.id,
      occurredAt: updated.updatedAt,
    }));
  }

  function declineConsent() {
    if (!session || !campaign) return;
    const updated = declineProspectConsent(session, campaign, new Date().toISOString());
    saveProspectSession(updated);
    setSession(updated);
    trackFunnelEvent(createFunnelEvent({
      name: "CONSENT_DECLINED",
      acquisition: updated.acquisition,
      sessionId: updated.id,
      occurredAt: updated.updatedAt,
    }));
  }

  function choose(value: string) {
    if (!session || !campaign || !currentField) return;
    setIsAdvancing(true);
    const updated = answerProspectQuestion(session, campaign, value, new Date().toISOString());
    saveProspectSession(updated);
    setSession(updated);

    if (updated.status === "COMPLETED") {
      completedRef.current = true;
      trackFunnelEvent(createFunnelEvent({
        name: "PROFILING_COMPLETED",
        acquisition: updated.acquisition,
        sessionId: updated.id,
        occurredAt: updated.updatedAt,
      }));
      router.push(`/orientacion/resultado/${updated.id}`);
      return;
    }
    window.setTimeout(() => setIsAdvancing(false), 160);
  }

  if (!loaded) return <PublicState title="Recuperando tu conversación…" description="Estamos leyendo el avance guardado en este dispositivo." />;
  if (!session || !campaign) return <PublicState title="No encontramos esta conversación." description="Puedes iniciar una nueva orientación desde el enlace de la campaña." action={{ label: "Empezar orientación", href: "/orientacion" }} />;
  if (session.status === "DECLINED") return <PublicState title="Está bien, no continuaremos." description="No usaremos esta conversación para generar una orientación. Puedes volver cuando quieras." action={{ label: "Volver", href: "/orientacion" }} />;
  if (session.status === "COMPLETED") return <PublicState title="Tu orientación ya está lista." description="Puedes consultar nuevamente lo que entendimos y el siguiente paso." action={{ label: "Ver orientación", href: `/orientacion/resultado/${session.id}` }} />;

  const currentQuestion = currentField ? questionBank[currentField] : undefined;
  const decisionNumber = session.status === "CONSENT" ? 1 : session.currentQuestionIndex + 2;
  const progress = Math.round((decisionNumber / MAX_PUBLIC_DECISIONS) * 100);
  const returnHref = `/orientacion?utm_source=${encodeURIComponent(session.acquisition.source)}&utm_campaign=${encodeURIComponent(session.acquisition.campaign)}&utm_content=${encodeURIComponent(session.acquisition.content)}`;

  return (
    <div className="min-h-screen bg-[linear-gradient(145deg,#f5fbff,#fffdf4_58%,#f7fbfd)] text-[color:var(--vm-color-ink)]">
      <header className="border-b border-[color:var(--vm-color-line)] bg-white">
        <div className="mx-auto flex min-h-[68px] max-w-[860px] items-center justify-between gap-4 px-4 sm:px-7">
          <Brand compact />
          <Link href={returnHref} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--vm-color-brand-blue)]/15 px-4 text-xs font-semibold text-[color:var(--vm-color-brand-blue)]"><Icon name="arrow" className="h-4 w-4 rotate-180" /> Guardar y salir</Link>
        </div>
      </header>

      <main className="mx-auto max-w-[860px] px-3 py-4 sm:px-7 sm:py-7">
        <div className="mb-3 flex items-center justify-between px-1 text-[11px] font-semibold text-[color:var(--vm-color-ink-muted)]">
          <span>Orientación de vivienda</span>
          <span>{decisionNumber} de {MAX_PUBLIC_DECISIONS}</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-[color:var(--vm-color-brand-blue)]/10"><div className="h-full rounded-full bg-[color:var(--vm-color-brand-blue)] transition-[width] duration-200" style={{ width: `${progress}%` }} /></div>

        <section className="mt-4 min-h-[620px] rounded-[26px] border border-[color:var(--vm-color-line)] bg-[#f8fcff] p-4 shadow-[var(--vm-shadow-low)] sm:p-7" aria-label="Conversación personalizada">
          <div className="mx-auto max-w-[690px] space-y-3">
            <AssistantMessage>Hola, {session.firstName}. {campaign.assistantIntro}</AssistantMessage>

            {session.status === "CONSENT" ? (
              <>
                <AssistantMessage>
                  Para orientarte necesitamos usar lo que nos cuentes y las señales de la campaña desde la que llegaste. Guardaremos el avance únicamente en este dispositivo durante esta validación.
                </AssistantMessage>
                <div className="ml-0 grid gap-2.5 pt-2 sm:ml-10 sm:max-w-[600px]">
                  <button type="button" onClick={acceptConsent} className="flex min-h-12 items-center justify-between rounded-[18px] border border-[color:var(--vm-color-brand-blue)]/20 bg-white px-4 py-3 text-left text-sm font-semibold hover:border-[color:var(--vm-color-brand-blue)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)]">Sí, quiero continuar <Icon name="arrow" className="h-4 w-4 text-[color:var(--vm-color-brand-blue)]" /></button>
                  <button type="button" onClick={declineConsent} className="min-h-11 px-4 text-left text-xs font-semibold text-[color:var(--vm-color-ink-muted)] underline decoration-[color:var(--vm-color-line)] underline-offset-4">No autorizo el uso de esta información</button>
                </div>
              </>
            ) : (
              <>
                <AssistantMessage>Gracias. Serán cinco preguntas breves y no necesitas documentos para responder.</AssistantMessage>
                {answeredFields.map((field) => {
                  const answer = session.answers[field];
                  if (!answer) return null;
                  return (
                    <div key={field} className="space-y-2.5">
                      <AssistantMessage>{questionBank[field].prompt}</AssistantMessage>
                      <UserMessage>{getAnswerLabel(field, answer)}</UserMessage>
                    </div>
                  );
                })}
                {currentQuestion ? (
                  <div className="space-y-2.5 pt-1" aria-live="polite">
                    <AssistantMessage>
                      <span className="text-[15px] font-semibold">{currentQuestion.prompt}</span>
                      {currentQuestion.explanation ? <span className="mt-2 block text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">{currentQuestion.explanation}</span> : null}
                    </AssistantMessage>
                    <div className="ml-0 flex max-w-[620px] flex-wrap gap-2 sm:ml-10">
                      {currentQuestion.options.map((option) => (
                        <button key={option.value} type="button" onClick={() => choose(option.value)} disabled={isAdvancing} className="min-h-11 rounded-full border border-[color:var(--vm-color-brand-blue)]/18 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:border-[color:var(--vm-color-brand-blue)] hover:bg-[color:var(--vm-color-brand-blue)]/[.04] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] disabled:opacity-[var(--vm-opacity-disabled)]">{option.label}</button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </section>
        <p className="mt-3 text-center text-[11px] leading-5 text-[color:var(--vm-color-ink-muted)]">Avance guardado en este dispositivo · Estimaciones orientativas · Sin aprobación automática</p>
      </main>
    </div>
  );
}

function AssistantMessage({ children }: { children: React.ReactNode }) {
  return <div className="flex items-end gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] text-white"><Icon name="sparkles" className="h-3.5 w-3.5" /></span><div className="max-w-[610px] rounded-[19px_19px_19px_6px] bg-white px-4 py-3 text-sm leading-6 shadow-sm">{children}</div></div>;
}

function UserMessage({ children }: { children: React.ReactNode }) {
  return <div className="ml-auto max-w-[520px] rounded-[19px_19px_6px_19px] bg-[color:var(--vm-color-brand-blue)] px-4 py-3 text-sm font-semibold leading-6 text-white">{children}</div>;
}

function PublicState({ title, description, action }: { title: string; description: string; action?: { label: string; href: string } }) {
  return <div className="grid min-h-screen place-items-center bg-[color:var(--vm-color-canvas)] px-5"><section className="surface-solid max-w-lg p-8 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]"><Icon name="sparkles" /></span><h1 className="mt-5 text-2xl font-semibold">{title}</h1><p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{description}</p>{action ? <Link href={action.href} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white">{action.label}<Icon name="arrow" className="h-4 w-4" /></Link> : null}</section></div>;
}
