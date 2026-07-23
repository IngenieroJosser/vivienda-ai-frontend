"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { Icon } from "@/components/icon";
import { createFunnelEvent, trackFunnelEvent } from "../analytics";
import {
  canSubmitChatMessage,
  CHAT_MESSAGE_MAX_LENGTH,
  chatReducer,
  getChatTransitionDelay,
  getTextareaHeight,
  initialChatState,
  isNearConversationEnd,
  scheduleChatTransition,
  shouldShowCharacterCounter,
  validateChatMessage,
} from "../chat-machine";
import { getInitialMessage } from "../conversation-policy";
import type { ProspectSession } from "../domain";
import {
  acceptProspectConsent,
  answerProspectMessage,
  declineProspectConsent,
} from "../engine";
import { takeSessionMessage } from "../pending-message";
import {
  loadProspectSessionResult,
  saveProspectSession,
} from "../storage";

export function ProspectConversation({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<ProspectSession | null>(null);
  const [loadStatus, setLoadStatus] = useState<
    "LOADING" | "READY" | "MISSING" | "ERROR"
  >("LOADING");
  const [message, setMessage] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [chatState, dispatch] = useReducer(chatReducer, initialChatState);
  const [animatedTurnId, setAnimatedTurnId] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const completedRef = useRef(false);
  const composingRef = useRef(false);
  const nearEndRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const sessionRef = useRef<ProspectSession | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const completeConversation = useCallback(
    (updated: ProspectSession) => {
      if (completedRef.current) return;
      completedRef.current = true;
      trackFunnelEvent(
        createFunnelEvent({
          name: "PROFILING_COMPLETED",
          acquisition: updated.acquisition,
          sessionId: updated.id,
          occurredAt: updated.updatedAt,
        }),
      );
      router.push(`/orientacion/resultado/${updated.id}`);
    },
    [router],
  );

  const loadConversation = useCallback(() => {
    const result = loadProspectSessionResult(sessionId);
    if (result.status === "ERROR") {
      setLoadStatus("ERROR");
      return;
    }
    if (result.status === "MISSING") {
      setSession(null);
      sessionRef.current = null;
      setLoadStatus("MISSING");
      return;
    }

    const stored = result.session;
    setSession(stored);
    sessionRef.current = stored;
    setLoadStatus("READY");
    if (stored.status === "ACTIVE") {
      const pendingMessage = takeSessionMessage(stored.id);
      if (pendingMessage) {
        dispatch({
          type: "SUBMIT",
          id: createMessageId(stored.id),
          rawMessage: pendingMessage,
        });
      }
    }
  }, [sessionId]);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = window.setTimeout(loadConversation, 0);
    return () => window.clearTimeout(timer);
  }, [loadConversation]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (
      chatState.phase === "idle" ||
      chatState.phase === "failed"
    ) {
      return;
    }
    const delay = getChatTransitionDelay(
      chatState.phase,
      reducedMotionRef.current,
    );
    return scheduleChatTransition(() => {
      switch (chatState.phase) {
        case "validating":
          dispatch({ type: "VALIDATED" });
          break;
        case "sending":
          dispatch({ type: "SENT" });
          break;
        case "waiting":
          dispatch({ type: "TYPING_STARTED" });
          break;
        case "typing": {
          const currentSession = sessionRef.current;
          if (!currentSession || currentSession.status !== "ACTIVE") {
            dispatch({
              type: "FAILED",
              error: "La conversación ya no está disponible para responder.",
            });
            break;
          }
          try {
            const updated = answerProspectMessage(
              currentSession,
              chatState.outgoing.text,
              new Date().toISOString(),
            );
            saveProspectSession(updated);
            sessionRef.current = updated;
            setSession(updated);
            setAnimatedTurnId(updated.turns.at(-1)?.id ?? "");
            dispatch({ type: "ANSWER_RECEIVED" });
          } catch {
            dispatch({
              type: "FAILED",
              error:
                "No pudimos procesar el mensaje. Tu texto sigue disponible.",
            });
          }
          break;
        }
        case "answered": {
          dispatch({ type: "RESET" });
          textareaRef.current?.focus({ preventScroll: true });
          const currentSession = sessionRef.current;
          if (currentSession?.status === "COMPLETED") {
            completeConversation(currentSession);
          }
          break;
        }
      }
    }, delay);
  }, [chatState, completeConversation]);

  const scrollToLatest = useCallback((behavior?: ScrollBehavior) => {
    conversationEndRef.current?.scrollIntoView({
      behavior:
        behavior ??
        (reducedMotionRef.current ? "auto" : "smooth"),
      block: "end",
    });
    setHasNewMessages(false);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (nearEndRef.current) {
        scrollToLatest();
      } else {
        setHasNewMessages(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [chatState.phase, scrollToLatest, session?.turns.length]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 12);
      const nearEnd = isNearConversationEnd({
        scrollTop: window.scrollY,
        viewportHeight: window.innerHeight,
        contentHeight: document.documentElement.scrollHeight,
      });
      nearEndRef.current = nearEnd;
      if (nearEnd) setHasNewMessages(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${getTextareaHeight({
      scrollHeight: message ? textarea.scrollHeight : 52,
    })}px`;
  }, [message]);

  useEffect(() => {
    if (!session || session.status !== "ACTIVE") return;
    const handlePageHide = () => {
      if (completedRef.current) return;
      trackFunnelEvent(
        createFunnelEvent({
          name: "QUESTION_ABANDONED",
          acquisition: session.acquisition,
          sessionId: session.id,
          questionId: session.nextAction,
          occurredAt: new Date().toISOString(),
        }),
      );
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [session]);

  function acceptConsent() {
    if (!session || !consentChecked) return;
    const acceptedAt = new Date().toISOString();
    const updated = acceptProspectConsent(session, acceptedAt);
    saveProspectSession(updated);
    setSession(updated);
    sessionRef.current = updated;
    trackFunnelEvent(
      createFunnelEvent({
        name: "CONSENT_ACCEPTED",
        acquisition: updated.acquisition,
        sessionId: updated.id,
        occurredAt: acceptedAt,
      }),
    );

    const pendingMessage = takeSessionMessage(updated.id);
    if (pendingMessage) {
      dispatch({
        type: "SUBMIT",
        id: createMessageId(updated.id),
        rawMessage: pendingMessage,
      });
    } else {
      window.setTimeout(
        () => textareaRef.current?.focus({ preventScroll: true }),
        0,
      );
    }
  }

  function declineConsent() {
    if (!session) return;
    const updated = declineProspectConsent(
      session,
      new Date().toISOString(),
    );
    saveProspectSession(updated);
    setSession(updated);
    sessionRef.current = updated;
    trackFunnelEvent(
      createFunnelEvent({
        name: "CONSENT_DECLINED",
        acquisition: updated.acquisition,
        sessionId: updated.id,
        occurredAt: updated.updatedAt,
      }),
    );
  }

  function submitMessage(rawMessage: string) {
    const currentSession = sessionRef.current;
    if (!currentSession || currentSession.status !== "ACTIVE") return;
    const validation = validateChatMessage(rawMessage);
    dispatch({
      type: "SUBMIT",
      id: createMessageId(currentSession.id),
      rawMessage,
    });
    if (validation.valid && chatState.phase === "idle") {
      setMessage("");
    }
  }

  if (loadStatus === "LOADING") return <ConversationLoading />;
  if (loadStatus === "ERROR") {
    return (
      <PublicState
        tone="error"
        title="No pudimos recuperar tu conversación."
        description="Tu información no fue modificada. Puedes intentar leer nuevamente el avance guardado en este dispositivo."
        button={{ label: "Intentar nuevamente", onClick: loadConversation }}
      />
    );
  }
  if (loadStatus === "MISSING" || !session) {
    return (
      <PublicState
        title="No encontramos esta conversación."
        description="Puedes iniciar una nueva orientación desde el enlace de la campaña."
        action={{ label: "Empezar orientación", href: "/orientacion" }}
      />
    );
  }
  if (session.status === "DECLINED") {
    return (
      <PublicState
        title="Está bien, no continuaremos."
        description="No usaremos esta conversación para generar una orientación. Puedes volver cuando quieras."
        action={{ label: "Volver", href: "/orientacion" }}
      />
    );
  }
  if (session.status === "COMPLETED" && chatState.phase === "idle") {
    return (
      <PublicState
        title="Tu orientación ya está lista."
        description="Puedes consultar nuevamente lo que entendimos y el siguiente paso."
        action={{
          label: "Ver orientación",
          href: `/orientacion/resultado/${session.id}`,
        }}
      />
    );
  }

  const outgoing =
    "outgoing" in chatState ? chatState.outgoing : undefined;
  const canSubmit = canSubmitChatMessage(chatState, message);
  const showCounter = shouldShowCharacterCounter(message.length);

  return (
    <div className="min-h-screen bg-[color:var(--vm-color-canvas)] text-[color:var(--vm-color-ink)]">
      <header
        className={`prospect-chat-header sticky top-0 z-20 border-b border-[color:var(--vm-color-line)] ${
          isScrolled
            ? "glass-subtle prospect-chat-header--scrolled"
            : "bg-white"
        }`}
      >
        <div className="mx-auto flex min-h-[62px] max-w-[760px] items-center gap-3 px-4 sm:px-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]">
            <Icon name="home" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-bold text-[color:var(--vm-color-brand-blue)]">
              Vivienda Colsubsidio
            </div>
            <div className="truncate text-[11px] text-[color:var(--vm-color-ink-muted)]">
              {chatState.phase === "typing"
                ? "Escribiendo…"
                : "Orientación virtual · A tu ritmo"}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[760px] px-4 pb-48 pt-6 sm:px-6 sm:pb-44">
        <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-[color:var(--vm-color-ink-muted)]">
          <span className="h-2 w-2 rounded-full bg-[color:var(--vm-color-success)]" />
          Puedes escribir con tus propias palabras
        </div>

        <section
          className="space-y-4"
          aria-label="Conversación de orientación"
          aria-live="polite"
        >
          <AssistantMessage animate>
            {getInitialMessage(session)}
          </AssistantMessage>
          {session.turns.map((turn) => (
            <div key={turn.id} className="space-y-4">
              <UserMessage>{turn.userText}</UserMessage>
              <AssistantMessage animate={turn.id === animatedTurnId}>
                {turn.assistantText}
              </AssistantMessage>
            </div>
          ))}
          {outgoing ? (
            <PendingUserMessage
              message={outgoing.text}
              delivery={outgoing.delivery}
              error={chatState.phase === "failed" ? chatState.error : undefined}
              onRetry={() => dispatch({ type: "RETRY" })}
            />
          ) : null}
          {chatState.phase === "typing" ? <TypingIndicator /> : null}
          <div ref={conversationEndRef} />
        </section>
      </main>

      {hasNewMessages ? (
        <button
          type="button"
          onClick={() => scrollToLatest("smooth")}
          className="fixed bottom-[142px] left-1/2 z-30 -translate-x-1/2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-4 py-2 text-xs font-bold text-white shadow-[var(--vm-shadow-medium)]"
        >
          Nuevos mensajes ↓
        </button>
      ) : null}

      {session.status === "ACTIVE" ? (
      <div className="prospect-chat-composer fixed inset-x-0 bottom-0 z-20 border-t border-[color:var(--vm-color-line)] bg-white">
        <div className="mx-auto max-w-[760px] px-4 py-4 sm:px-6">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitMessage(message);
            }}
            className="flex items-end gap-2"
          >
            <label className="min-w-0 flex-1">
              <span className="sr-only">Escribe tu respuesta</span>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value.slice(0, CHAT_MESSAGE_MAX_LENGTH),
                  )
                }
                onCompositionStart={() => {
                  composingRef.current = true;
                }}
                onCompositionEnd={() => {
                  composingRef.current = false;
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing &&
                    !composingRef.current
                  ) {
                    event.preventDefault();
                    submitMessage(message);
                  }
                }}
                rows={1}
                maxLength={CHAT_MESSAGE_MAX_LENGTH}
                disabled={chatState.phase !== "idle"}
                placeholder={
                  chatState.phase === "idle"
                    ? "Escribe un mensaje…"
                    : "Espera la respuesta…"
                }
                className="form-field prospect-textarea min-h-[52px] resize-none rounded-[18px] py-3 disabled:opacity-70"
              />
              <div className="mt-1 min-h-4 px-2 text-right text-[10px]">
                {chatState.phase === "idle" &&
                "validationError" in chatState &&
                chatState.validationError ? (
                  <span role="alert" className="float-left text-rose-700">
                    {chatState.validationError}
                  </span>
                ) : null}
                {showCounter ? (
                  <span
                    className={
                      message.length >= CHAT_MESSAGE_MAX_LENGTH
                        ? "text-rose-700"
                        : "text-[color:var(--vm-color-ink-muted)]"
                    }
                  >
                    {message.length}/{CHAT_MESSAGE_MAX_LENGTH}
                  </span>
                ) : null}
              </div>
            </label>
            <button
              type="submit"
              disabled={!canSubmit}
              aria-label="Enviar respuesta"
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-full transition duration-150 focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] ${
                canSubmit
                  ? "bg-[color:var(--vm-color-brand-blue)] text-white shadow-[var(--vm-shadow-low)] hover:-translate-y-0.5 hover:bg-[color:var(--vm-color-brand-blue-deep)] active:translate-y-0"
                  : "bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]/40"
              }`}
            >
              <Icon name="arrow" className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between gap-3 text-[10px] leading-4 text-[color:var(--vm-color-ink-muted)]">
            <span>
              La orientación es preliminar y no constituye aprobación.
            </span>
            <span className="shrink-0">Guardado en este dispositivo</span>
          </div>
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
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
        className="surface-solid w-full max-w-lg p-6 shadow-[var(--vm-shadow-high)] sm:p-8"
      >
        <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
          Antes de conversar
        </div>
        <h1 id="consent-title" className="mt-3 text-2xl font-semibold">
          Tu información se usará para orientarte.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
          Usaremos tus respuestas y la información básica asociada al contacto
          para comprender tu búsqueda, estimar un rango orientativo y recomendar
          un siguiente paso. El avance se guardará en este dispositivo.
        </p>
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] p-4">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckedChange(event.target.checked)}
            className="mt-0.5 h-5 w-5 accent-[color:var(--vm-color-brand-blue)]"
          />
          <span className="text-sm font-semibold leading-6">
            Autorizo el tratamiento de esta información para recibir mi
            orientación de vivienda.
          </span>
        </label>
        <Link
          href="https://www.colsubsidio.com/transparencia-acceso-informacion/tratamiento-datos-personales"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex text-xs font-semibold text-[color:var(--vm-color-brand-blue)]"
        >
          Consultar el tratamiento de información
        </Link>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onAccept}
            disabled={!checked}
            className="min-h-12 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white disabled:opacity-[var(--vm-opacity-disabled)]"
          >
            Aceptar y conversar
          </button>
          <button
            type="button"
            onClick={onDecline}
            className="min-h-12 rounded-full border border-[color:var(--vm-color-line)] px-5 text-sm font-semibold text-[color:var(--vm-color-ink-muted)]"
          >
            No continuar
          </button>
        </div>
      </section>
    </div>
  );
}

function AssistantMessage({
  children,
  animate = false,
}: {
  children: React.ReactNode;
  animate?: boolean;
}) {
  return (
    <div className={`max-w-[610px] ${animate ? "prospect-message-left" : ""}`}>
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">
        Vivienda Colsubsidio
      </div>
      <div className="whitespace-pre-line rounded-[18px_18px_18px_5px] border border-[color:var(--vm-color-line)] bg-white px-4 py-3 text-sm leading-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}

function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-auto max-w-[520px] whitespace-pre-line rounded-[18px_18px_5px_18px] bg-[color:var(--vm-color-brand-blue)] px-4 py-3 text-sm font-semibold leading-6 text-white">
      {children}
    </div>
  );
}

function PendingUserMessage({
  message,
  delivery,
  error,
  onRetry,
}: {
  message: string;
  delivery: "sending" | "sent" | "failed";
  error?: string;
  onRetry: () => void;
}) {
  return (
    <div className="prospect-message-right ml-auto max-w-[520px]">
      <div
        className={`whitespace-pre-line rounded-[18px_18px_5px_18px] px-4 py-3 text-sm font-semibold leading-6 text-white ${
          delivery === "failed"
            ? "bg-rose-700"
            : "bg-[color:var(--vm-color-brand-blue)]"
        }`}
      >
        {message}
      </div>
      <div
        role={delivery === "failed" ? "alert" : "status"}
        className={`mt-1.5 flex items-center justify-end gap-2 text-[10px] ${
          delivery === "failed"
            ? "text-rose-700"
            : "text-[color:var(--vm-color-ink-muted)]"
        }`}
      >
        <span>
          {delivery === "sending"
            ? "Enviando…"
            : delivery === "sent"
              ? "Enviado"
              : error}
        </span>
        {delivery === "failed" ? (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-8 rounded-full border border-rose-200 bg-white px-3 font-bold"
          >
            Reintentar
          </button>
        ) : null}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="prospect-message-left w-fit" role="status">
      <div className="mb-1.5 text-[10px] font-bold text-[color:var(--vm-color-brand-blue)]">
        Colsubsidio está escribiendo…
      </div>
      <div
        className="rounded-[18px_18px_18px_5px] border border-[color:var(--vm-color-line)] bg-white px-4 py-3"
        aria-hidden="true"
      >
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

function ConversationLoading() {
  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className="min-h-screen bg-[color:var(--vm-color-canvas)]"
    >
      <div className="h-[62px] border-b border-[color:var(--vm-color-line)] bg-white" />
      <main className="mx-auto max-w-[760px] space-y-5 px-4 py-7 sm:px-6">
        <div className="h-20 w-[78%] animate-pulse rounded-[18px] bg-white" />
        <div className="ml-auto h-16 w-[62%] animate-pulse rounded-[18px] bg-[color:var(--vm-color-brand-blue)]/10" />
        <div className="h-24 w-[82%] animate-pulse rounded-[18px] bg-white" />
      </main>
      <span className="sr-only">Recuperando tu conversación</span>
    </div>
  );
}

function PublicState({
  title,
  description,
  action,
  button,
  tone = "default",
}: {
  title: string;
  description: string;
  action?: { label: string; href: string };
  button?: { label: string; onClick: () => void };
  tone?: "default" | "error";
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-[color:var(--vm-color-canvas)] px-5">
      <section className="surface-solid max-w-lg p-8 text-center">
        <span
          className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${
            tone === "error"
              ? "bg-rose-50 text-rose-700"
              : "bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]"
          }`}
        >
          <Icon name={tone === "error" ? "alert" : "home"} />
        </span>
        <h1 className="mt-5 text-2xl font-semibold">{title}</h1>
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
        {button ? (
          <button
            type="button"
            onClick={button.onClick}
            className="mt-6 min-h-12 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white"
          >
            {button.label}
          </button>
        ) : null}
      </section>
    </div>
  );
}

function createMessageId(sessionId: string): string {
  return `${sessionId}-${crypto.randomUUID()}`;
}
