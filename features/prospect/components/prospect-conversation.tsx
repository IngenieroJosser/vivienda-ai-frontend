"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { createFunnelEvent, trackFunnelEvent } from "../analytics";
import { getInitialMessage } from "../conversation-policy";
import type { ProspectSession } from "../domain";
import { acceptProspectConsent, answerProspectMessage, declineProspectConsent } from "../engine";
import { takeSessionMessage } from "../pending-message";
import { loadProspectSession, saveProspectSession } from "../storage";

export function ProspectConversation({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<ProspectSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [pendingUserMessage, setPendingUserMessage] = useState("");
  const [animatedTurnId, setAnimatedTurnId] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const completedRef = useRef(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let stored = loadProspectSession(sessionId) ?? null;
      if (stored?.status === "ACTIVE") {
        const pendingMessage = takeSessionMessage(stored.id);
        if (pendingMessage) {
          stored = answerProspectMessage(stored, pendingMessage, new Date().toISOString());
          saveProspectSession(stored);
          setAnimatedTurnId(stored.turns.at(-1)?.id ?? "");
          if (stored.status === "COMPLETED") {
            completedRef.current = true;
            trackFunnelEvent(createFunnelEvent({
              name: "PROFILING_COMPLETED",
              acquisition: stored.acquisition,
              sessionId: stored.id,
              occurredAt: stored.updatedAt,
            }));
            router.replace(`/orientacion/resultado/${stored.id}`);
          }
        }
      }
      setSession(stored);
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router, sessionId]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    conversationEndRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [isAdvancing, pendingUserMessage, session?.turns.length, session?.status]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    const acceptedAt = new Date().toISOString();
    const updated = acceptProspectConsent(session, acceptedAt);
    const pendingMessage = takeSessionMessage(updated.id);
    saveProspectSession(updated);
    setSession(updated);
    trackFunnelEvent(createFunnelEvent({
      name: "CONSENT_ACCEPTED",
      acquisition: updated.acquisition,
      sessionId: updated.id,
      occurredAt: acceptedAt,
    }));

    if (pendingMessage) {
      setPendingUserMessage(pendingMessage);
      setIsAdvancing(true);
      window.requestAnimationFrame(() => {
        const answered = answerProspectMessage(updated, pendingMessage, new Date().toISOString());
        saveProspectSession(answered);
        setSession(answered);
        setAnimatedTurnId(answered.turns.at(-1)?.id ?? "");
        setPendingUserMessage("");
        setIsAdvancing(false);
        if (answered.status === "COMPLETED") completeConversation(answered);
      });
    }
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
    setPendingUserMessage(cleanMessage);
    setMessage("");
    window.requestAnimationFrame(() => {
      const updated = answerProspectMessage(session, cleanMessage, new Date().toISOString());
      saveProspectSession(updated);
      setSession(updated);
      setAnimatedTurnId(updated.turns.at(-1)?.id ?? "");
      setPendingUserMessage("");
      setIsAdvancing(false);

      if (updated.status === "COMPLETED") completeConversation(updated);
    });
  }

  function completeConversation(updated: ProspectSession) {
    completedRef.current = true;
    trackFunnelEvent(createFunnelEvent({
      name: "PROFILING_COMPLETED",
      acquisition: updated.acquisition,
      sessionId: updated.id,
      occurredAt: updated.updatedAt,
    }));
    router.push(`/orientacion/resultado/${updated.id}`);
  }

  if (!loaded) return <PublicState title="Recuperando tu conversación…" description="Estamos leyendo el avance guardado en este dispositivo." />;
  if (!session) return <PublicState title="No encontramos esta conversación." description="Puedes iniciar una nueva orientación desde el enlace de la campaña." action={{ label: "Empezar orientación", href: "/orientacion" }} />;
  if (session.status === "DECLINED") return <PublicState title="Está bien, no continuaremos." description="No usaremos esta conversación para generar una orientación. Puedes volver cuando quieras." action={{ label: "Volver", href: "/orientacion" }} />;
  if (session.status === "COMPLETED") return <PublicState title="Tu orientación ya está lista." description="Puedes consultar nuevamente lo que entendimos y el siguiente paso." action={{ label: "Ver orientación", href: `/orientacion/resultado/${session.id}` }} />;

  return (
    <div className="min-h-screen bg-[color:var(--vm-color-canvas)] text-[color:var(--vm-color-ink)]">
      <header className={`prospect-chat-header sticky top-0 z-20 border-b border-[color:var(--vm-color-line)] ${isScrolled ? "glass-subtle prospect-chat-header--scrolled" : "bg-white"}`}>
        <div className="mx-auto flex min-h-[62px] max-w-[760px] items-center gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]"><Icon name="home" className="h-5 w-5" /></span>
            <div className="min-w-0">
              <div className="text-sm font-bold text-[color:var(--vm-color-brand-blue)]">Vivienda Colsubsidio</div>
              <div className="truncate text-[11px] text-[color:var(--vm-color-ink-muted)]">Orientación virtual · A tu ritmo</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[760px] px-4 pb-44 pt-6 sm:px-6 sm:pb-40">
        <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-[color:var(--vm-color-ink-muted)]">
          <span className="h-2 w-2 rounded-full bg-[color:var(--vm-color-success)]" />
          Puedes escribir con tus propias palabras
        </div>

        <section className="space-y-4" aria-label="Conversación de orientación" aria-live="polite">
          {session.status === "ACTIVE" ? (
            <>
              <AssistantMessage animate>{getInitialMessage(session)}</AssistantMessage>
              {session.turns.map((turn) => (
                <div key={turn.id} className="space-y-4">
                  <UserMessage>{turn.userText}</UserMessage>
                  <AssistantMessage animate={turn.id === animatedTurnId}>{turn.assistantText}</AssistantMessage>
                </div>
              ))}
              {pendingUserMessage ? <UserMessage animate>{pendingUserMessage}</UserMessage> : null}
              {isAdvancing ? <TypingIndicator /> : null}
            </>
          ) : null}
          <div ref={conversationEndRef} />
        </section>
      </main>

      {session.status === "ACTIVE" ? (
        <div className="prospect-chat-composer fixed inset-x-0 bottom-0 z-20 border-t border-[color:var(--vm-color-line)] bg-white">
          <div className="mx-auto max-w-[760px] px-4 py-4 sm:px-6">
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
                  rows={1}
                  maxLength={600}
                  placeholder="Escribe un mensaje…"
                  className="form-field prospect-textarea min-h-[52px] resize-none rounded-[18px] py-3"
                />
              </label>
              <button
                type="submit"
                disabled={!message.trim() || isAdvancing}
                aria-label="Enviar respuesta"
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-full transition duration-150 focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] ${
                  message.trim() && !isAdvancing
                    ? "bg-[color:var(--vm-color-brand-blue)] text-white shadow-[var(--vm-shadow-low)] hover:-translate-y-0.5 hover:bg-[color:var(--vm-color-brand-blue-deep)]"
                    : "bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]/40"
                }`}
              >
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

function AssistantMessage({ children, animate = false }: { children: React.ReactNode; animate?: boolean }) {
  return (
    <div className={`max-w-[610px] ${animate ? "prospect-message-left" : ""}`}>
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">Vivienda Colsubsidio</div>
      <div className="whitespace-pre-line rounded-[18px_18px_18px_5px] border border-[color:var(--vm-color-line)] bg-white px-4 py-3 text-sm leading-6 shadow-sm">{children}</div>
    </div>
  );
}

function UserMessage({ children, animate = false }: { children: React.ReactNode; animate?: boolean }) {
  return <div className={`ml-auto max-w-[520px] rounded-[18px_18px_5px_18px] bg-[color:var(--vm-color-brand-blue)] px-4 py-3 text-sm font-semibold leading-6 text-white ${animate ? "prospect-message-right" : ""}`}>{children}</div>;
}

function TypingIndicator() {
  return (
    <div className="prospect-message-left w-fit rounded-[18px_18px_18px_5px] border border-[color:var(--vm-color-line)] bg-white px-4 py-3" role="status" aria-label="Vivienda Colsubsidio está respondiendo">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

function PublicState({ title, description, action }: { title: string; description: string; action?: { label: string; href: string } }) {
  return <div className="grid min-h-screen place-items-center bg-[color:var(--vm-color-canvas)] px-5"><section className="surface-solid max-w-lg p-8 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]"><Icon name="home" /></span><h1 className="mt-5 text-2xl font-semibold">{title}</h1><p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{description}</p>{action ? <Link href={action.href} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white">{action.label}<Icon name="arrow" className="h-4 w-4" /></Link> : null}</section></div>;
}
