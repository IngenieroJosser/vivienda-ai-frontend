"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { createFunnelEvent, trackFunnelEvent } from "../analytics";
import { getInitialMessage, getSuggestions } from "../conversation-policy";
import type { ProspectSession } from "../domain";
import { acceptProspectConsent, answerProspectMessage, declineProspectConsent } from "../engine";
import { loadProspectSession, saveProspectSession } from "../storage";

export function ProspectConversation({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<ProspectSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const completedRef = useRef(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSession(loadProspectSession(sessionId) ?? null);
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [sessionId]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [session?.turns.length, session?.status]);

  useEffect(() => {
    if (!session || session.status !== "ACTIVE") return;
    const handlePageHide = () => {
      if (completedRef.current) return;
      trackFunnelEvent(createFunnelEvent({
        name: "QUESTION_ABANDONED",
        acquisition: session.acquisition,
        sessionId: session.id,
        questionId: session.nextAction,
        occurredAt: new Date().toISOString(),
      }));
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [session]);

  function acceptConsent() {
    if (!session || !consentChecked) return;
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
    if (!session) return;
    const updated = declineProspectConsent(session, new Date().toISOString());
    saveProspectSession(updated);
    setSession(updated);
    trackFunnelEvent(createFunnelEvent({
      name: "CONSENT_DECLINED",
      acquisition: updated.acquisition,
      sessionId: updated.id,
      occurredAt: updated.updatedAt,
    }));
  }

  function send(rawMessage: string) {
    if (!session || session.status !== "ACTIVE" || isAdvancing) return;
    const cleanMessage = rawMessage.trim();
    if (!cleanMessage) return;

    setIsAdvancing(true);
    setMessage("");
    const updated = answerProspectMessage(session, cleanMessage, new Date().toISOString());
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
    window.setTimeout(() => setIsAdvancing(false), 140);
  }

  function trackAdvisorRequest() {
    if (!session) return;
    trackFunnelEvent(createFunnelEvent({
      name: "NEXT_ACTION_CLICKED",
      acquisition: session.acquisition,
      sessionId: session.id,
      occurredAt: new Date().toISOString(),
    }));
  }

  if (!loaded) return <PublicState title="Recuperando tu conversación…" description="Estamos leyendo el avance guardado en este dispositivo." />;
  if (!session) return <PublicState title="No encontramos esta conversación." description="Puedes iniciar una nueva orientación desde el enlace de la campaña." action={{ label: "Empezar orientación", href: "/orientacion" }} />;
  if (session.status === "DECLINED") return <PublicState title="Está bien, no continuaremos." description="No usaremos esta conversación para generar una orientación. Puedes volver cuando quieras." action={{ label: "Volver", href: "/orientacion" }} />;
  if (session.status === "COMPLETED") return <PublicState title="Tu orientación ya está lista." description="Puedes consultar nuevamente lo que entendimos y el siguiente paso." action={{ label: "Ver orientación", href: `/orientacion/resultado/${session.id}` }} />;

  const suggestions = getSuggestions(session.nextAction);
  const advisorHref = `/vivienda/agendar?from=conversation&sessionId=${encodeURIComponent(session.id)}`;

  return (
    <div className="min-h-screen bg-[color:var(--vm-color-canvas)] text-[color:var(--vm-color-ink)]">
      <header className="sticky top-0 z-20 border-b border-[color:var(--vm-color-line)] bg-white">
        <div className="mx-auto flex min-h-[68px] max-w-[760px] items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]"><Icon name="home" className="h-5 w-5" /></span>
            <div className="min-w-0">
              <div className="text-sm font-bold text-[color:var(--vm-color-brand-blue)]">Vivienda Colsubsidio</div>
              <div className="truncate text-[11px] text-[color:var(--vm-color-ink-muted)]">Orientación virtual · A tu ritmo</div>
            </div>
          </div>
          <Link href={advisorHref} onClick={trackAdvisorRequest} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-[color:var(--vm-color-brand-blue)]/20 px-3 text-xs font-bold text-[color:var(--vm-color-brand-blue)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)]">
            <Icon name="phone" className="h-4 w-4" /> <span className="hidden sm:inline">Solicitar asesor</span><span className="sm:hidden">Asesor</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[760px] px-4 pb-72 pt-6 sm:px-6 sm:pb-60">
        <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-[color:var(--vm-color-ink-muted)]">
          <span className="h-2 w-2 rounded-full bg-[color:var(--vm-color-success)]" />
          Puedes escribir con tus propias palabras
        </div>

        <section className="space-y-4" aria-label="Conversación de orientación" aria-live="polite">
          <AssistantMessage>{getInitialMessage(session)}</AssistantMessage>
          {session.turns.map((turn) => (
            <div key={turn.id} className="space-y-4">
              <UserMessage>{turn.userText}</UserMessage>
              <AssistantMessage>{turn.assistantText}</AssistantMessage>
            </div>
          ))}
          <div ref={conversationEndRef} />
        </section>
      </main>

      {session.status === "ACTIVE" ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[color:var(--vm-color-line)] bg-white">
          <div className="mx-auto max-w-[760px] px-4 py-4 sm:px-6">
            {suggestions.length ? (
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1" aria-label="Sugerencias opcionales">
                {suggestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => send(suggestion)} disabled={isAdvancing} className="min-h-10 shrink-0 rounded-full border border-[color:var(--vm-color-brand-blue)]/20 bg-[color:var(--vm-color-brand-blue)]/[.035] px-3.5 text-xs font-semibold text-[color:var(--vm-color-brand-blue)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] disabled:opacity-[var(--vm-opacity-disabled)]">
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
            <form onSubmit={(event) => { event.preventDefault(); send(message); }} className="flex items-end gap-2">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Escribe tu respuesta</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      send(message);
                    }
                  }}
                  rows={2}
                  maxLength={600}
                  placeholder="Escribe con tus propias palabras…"
                  className="form-field min-h-[52px] resize-none rounded-[18px] py-3"
                />
              </label>
              <button type="submit" disabled={!message.trim() || isAdvancing} aria-label="Enviar respuesta" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] text-white transition hover:bg-[color:var(--vm-color-brand-blue-deep)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] disabled:opacity-[var(--vm-opacity-disabled)]">
                <Icon name="arrow" className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-3 text-[10px] leading-4 text-[color:var(--vm-color-ink-muted)]">La orientación es preliminar y no constituye aprobación de crédito, subsidio o disponibilidad.</p>
          </div>
        </div>
      ) : null}

      {session.status === "CONSENT" ? (
        <ConsentLayer
          checked={consentChecked}
          onCheckedChange={setConsentChecked}
          onAccept={acceptConsent}
          onDecline={declineConsent}
        />
      ) : null}
    </div>
  );
}

function ConsentLayer({
  checked,
  onCheckedChange,
  onAccept,
  onDecline,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[color:var(--vm-color-brand-blue-deep)]/20 px-4 py-8">
      <section role="dialog" aria-modal="true" aria-labelledby="consent-title" className="surface-solid w-full max-w-lg p-6 shadow-[var(--vm-shadow-high)] sm:p-8">
        <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Antes de conversar</div>
        <h1 id="consent-title" className="mt-3 text-2xl font-semibold">Tu información se usará para orientarte.</h1>
        <p className="mt-4 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Usaremos tus respuestas y la información básica asociada al contacto para comprender tu búsqueda, estimar un rango orientativo y recomendar un siguiente paso. El avance se guardará en este dispositivo.</p>
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] p-4">
          <input type="checkbox" checked={checked} onChange={(event) => onCheckedChange(event.target.checked)} className="mt-0.5 h-5 w-5 accent-[color:var(--vm-color-brand-blue)]" />
          <span className="text-sm font-semibold leading-6">Autorizo el tratamiento de esta información para recibir mi orientación de vivienda.</span>
        </label>
        <Link href="https://www.colsubsidio.com/transparencia-acceso-informacion/tratamiento-datos-personales" target="_blank" rel="noreferrer" className="mt-4 inline-flex text-xs font-semibold text-[color:var(--vm-color-brand-blue)]">Consultar el tratamiento de información</Link>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onAccept} disabled={!checked} className="min-h-12 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white disabled:opacity-[var(--vm-opacity-disabled)]">Aceptar y conversar</button>
          <button type="button" onClick={onDecline} className="min-h-12 rounded-full border border-[color:var(--vm-color-line)] px-5 text-sm font-semibold text-[color:var(--vm-color-ink-muted)]">No continuar</button>
        </div>
      </section>
    </div>
  );
}

function AssistantMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[610px]">
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">Vivienda Colsubsidio</div>
      <div className="whitespace-pre-line rounded-[18px_18px_18px_5px] border border-[color:var(--vm-color-line)] bg-white px-4 py-3 text-sm leading-6 shadow-sm">{children}</div>
    </div>
  );
}

function UserMessage({ children }: { children: React.ReactNode }) {
  return <div className="ml-auto max-w-[520px] rounded-[18px_18px_5px_18px] bg-[color:var(--vm-color-brand-blue)] px-4 py-3 text-sm font-semibold leading-6 text-white">{children}</div>;
}

function PublicState({ title, description, action }: { title: string; description: string; action?: { label: string; href: string } }) {
  return <div className="grid min-h-screen place-items-center bg-[color:var(--vm-color-canvas)] px-5"><section className="surface-solid max-w-lg p-8 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]"><Icon name="home" /></span><h1 className="mt-5 text-2xl font-semibold">{title}</h1><p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{description}</p>{action ? <Link href={action.href} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white">{action.label}<Icon name="arrow" className="h-4 w-4" /></Link> : null}</section></div>;
}
