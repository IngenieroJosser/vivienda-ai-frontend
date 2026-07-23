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
import {
  HousingWindow,
  OrientationHeader,
  OrientationTrustStrip,
} from "@/components/orientation-visuals";
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
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const completedRef = useRef(false);
  const composingRef = useRef(false);
  const nearEndRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const sessionRef = useRef<ProspectSession | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const completeConversation = useCallback(
    (updated: ProspectSession) => {
      if (completedRef.current) return;
      completedRef.current = true;
      trackFunnelEvent(
        createFunnelEvent({
          name: updated.serviceGuidance
            ? "SERVICE_ROUTE_IDENTIFIED"
            : "PROFILING_COMPLETED",
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
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const onScroll = () => {
      const nearEnd = isNearConversationEnd({
        scrollTop: scrollContainer.scrollTop,
        viewportHeight: scrollContainer.clientHeight,
        contentHeight: scrollContainer.scrollHeight,
      });
      nearEndRef.current = nearEnd;
      if (nearEnd) setHasNewMessages(false);
    };
    onScroll();
    scrollContainer.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [loadStatus]);

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
  const conversationHeading = session.firstName
    ? `${session.firstName}, este espacio es para escucharte.`
    : "Este espacio es para escucharte.";

  return (
    <div className="orientation-experience orientation-chat flex h-[100dvh] flex-col overflow-hidden">
      <OrientationHeader
        status={
          chatState.phase === "typing"
            ? "Respondiendo"
            : "Orientación activa"
        }
      />

      <div
        ref={scrollContainerRef}
        className="orientation-chat-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
      <div className="mx-auto grid max-w-[1180px] gap-8 px-4 pb-12 pt-6 sm:px-6 lg:grid-cols-[280px_minmax(0,800px)] lg:gap-12 lg:px-8 lg:pt-9">
        <aside className="hidden lg:block">
          <div className="orientation-chat-aside sticky top-3">
            <HousingWindow compact />
            <div className="px-2 pt-7">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[color:var(--vm-color-brand-blue)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--vm-color-brand-yellow)]" />
                Conversación a tu ritmo
              </div>
              <h2 className="mt-4 text-[1.75rem] font-semibold leading-[1.04] tracking-[-.05em]">
                Tu historia importa más que llenar un formulario.
              </h2>
              <p className="mt-4 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
                Cuéntanos qué imaginas, qué te preocupa y qué necesitas para
                avanzar. La conversación se adapta a ti.
              </p>
              <div className="orientation-chat-principle mt-6">
                <span className="orientation-chat-principle__icon">
                  <Icon name="heart" className="h-4 w-4" />
                </span>
                <div>
                  <strong>Sin respuestas correctas</strong>
                  <p>Escribe como hablarías normalmente.</p>
                </div>
              </div>
              <div className="orientation-chat-principle">
                <span className="orientation-chat-principle__icon">
                  <Icon name="lock" className="h-4 w-4" />
                </span>
                <div>
                  <strong>Tú mantienes el control</strong>
                  <p>Tu avance queda guardado en este dispositivo.</p>
                </div>
              </div>
              <div className="mt-6 border-t border-[color:var(--vm-color-line)] pt-5">
                <OrientationTrustStrip />
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <section className="orientation-chat-intro">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[color:var(--vm-color-brand-blue)]">
                  <Icon name="home" className="h-4 w-4" />
                  Tu orientación de vivienda
                </div>
                <span className="inline-flex items-center gap-2 text-[10px] font-bold text-[color:var(--vm-color-success)]">
                  <span className="h-2 w-2 rounded-full bg-[color:var(--vm-color-success)]" />
                  Avance guardado
                </span>
              </div>
              <h1 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.02] tracking-[-.052em] sm:text-[2.65rem]">
                {conversationHeading}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[color:var(--vm-color-ink-muted)] sm:text-[15px]">
                No tienes que organizar tus ideas antes de escribir. Vivienda
                Colsubsidio te ayudará a convertir lo que buscas en un siguiente
                paso claro.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="orientation-chat-attribute">
                  <Icon name="heart" className="h-3.5 w-3.5" />
                  Conversación libre
                </span>
                <span className="orientation-chat-attribute">
                  <Icon name="shield" className="h-3.5 w-3.5" />
                  Información protegida
                </span>
              </div>
            </div>
          </section>

          <div className="orientation-thread-shell mt-5">
            <div className="orientation-thread-shell__header">
              <div>
                <div className="text-xs font-bold">Vivienda Colsubsidio</div>
                <div className="mt-0.5 text-[10px] text-[color:var(--vm-color-ink-muted)]">
                  Orientación personalizada
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[color:var(--vm-color-ink-muted)]">
                <Icon name="lock" className="h-3.5 w-3.5" />
                Conversación protegida
              </span>
            </div>
          <section
            className="orientation-thread space-y-5"
            aria-label="Conversación de orientación"
            aria-live="polite"
          >
            <AssistantMessage animate>
              {getInitialMessage(session)}
            </AssistantMessage>
            {session.turns.map((turn) => (
              <div key={turn.id} className="space-y-5">
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
          </div>
        </main>
      </div>
      </div>

      {session.status === "ACTIVE" ? (
      <div className="prospect-chat-composer orientation-composer relative z-20 flex-none border-t border-[color:var(--vm-color-line)]">
        {hasNewMessages ? (
          <button
            type="button"
            onClick={() => scrollToLatest("smooth")}
            className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-4 py-2 text-xs font-bold text-white shadow-[var(--vm-shadow-medium)]"
          >
            Nuevos mensajes ↓
          </button>
        ) : null}
        <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-3 sm:px-6 lg:grid-cols-[280px_minmax(0,800px)] lg:gap-12 lg:px-8">
          <div className="hidden lg:block" aria-hidden="true" />
          <div className="orientation-composer__content">
          <div className="mb-2 hidden items-center justify-between px-2 sm:flex">
            <span className="text-[10px] font-bold uppercase tracking-[.12em] text-[color:var(--vm-color-brand-blue)]">
              Cuéntanos con tus palabras
            </span>
            <span className="text-[10px] text-[color:var(--vm-color-ink-muted)]">
              Enter para enviar · Shift + Enter para nueva línea
            </span>
          </div>
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
                    ? "Escribe lo que buscas, necesitas o te preocupa…"
                    : "Espera la respuesta…"
                }
                className="orientation-textarea prospect-textarea min-h-[56px] resize-none rounded-[20px] border-0 bg-transparent px-4 py-3.5 text-base leading-6 outline-none disabled:opacity-70"
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
              className={`orientation-send-button flex h-13 shrink-0 items-center justify-center gap-2 rounded-full px-4 transition duration-150 focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] sm:min-w-[112px] ${
                canSubmit
                  ? "bg-[color:var(--vm-color-brand-blue)] text-white shadow-[var(--vm-shadow-low)] hover:-translate-y-0.5 hover:bg-[color:var(--vm-color-brand-blue-deep)] active:translate-y-0"
                  : "bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]/40"
              }`}
            >
              <span className="hidden text-xs font-bold sm:inline">Enviar</span>
              <Icon name="arrow" className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between gap-3 px-2 text-[10px] leading-4 text-[color:var(--vm-color-ink-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="info" className="h-3.5 w-3.5" />
              Orientación preliminar
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5">
              <Icon name="check" className="h-3.5 w-3.5 text-[color:var(--vm-color-success)]" />
              Guardado local
            </span>
          </div>
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
    <div className="orientation-consent fixed inset-0 z-50 grid place-items-center overflow-y-auto px-4 py-8">
      <div className="grid w-full max-w-[980px] items-center gap-8 lg:grid-cols-[.82fr_1.18fr]">
        <div className="hidden lg:block">
          <HousingWindow label="Comencemos con claridad y confianza" />
          <p className="mt-5 px-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
            Tu orientación se construye con lo que ya conocemos y lo que decidas
            contarnos. Tú mantienes el control.
          </p>
        </div>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
        className="orientation-consent-card w-full rounded-[32px] bg-white p-6 shadow-[var(--vm-shadow-high)] sm:p-9"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-yellow)]/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-[color:var(--vm-color-brand-blue-deep)]">
          <Icon name="shield" className="h-4 w-4" />
          Antes de conversar
        </div>
        <h1 id="consent-title" className="mt-5 text-3xl font-semibold leading-tight tracking-[-.045em] sm:text-4xl">
          Tu información convierte preguntas en una orientación útil.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
          Usaremos tus respuestas y la información básica asociada al contacto
          para comprender tu búsqueda, estimar un rango orientativo y recomendar
          un siguiente paso. El avance se guardará en este dispositivo.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["heart", "Comprender", "Tu búsqueda y motivación"],
            ["money", "Estimar", "Un rango responsable"],
            ["target", "Orientar", "Tu siguiente paso"],
          ].map(([icon, title, detail]) => (
            <div key={title} className="rounded-[18px] bg-[color:var(--vm-color-brand-blue)]/[.045] p-4">
              <Icon name={icon as Parameters<typeof Icon>[0]["name"]} className="h-4 w-4 text-[color:var(--vm-color-brand-blue)]" />
              <div className="mt-3 text-xs font-bold">{title}</div>
              <div className="mt-1 text-[10px] leading-4 text-[color:var(--vm-color-ink-muted)]">{detail}</div>
            </div>
          ))}
        </div>
        <label className={`mt-5 flex cursor-pointer items-start gap-3 rounded-[18px] border p-4 transition ${checked ? "border-[color:var(--vm-color-brand-blue)] bg-[color:var(--vm-color-brand-blue)]/[.045]" : "border-[color:var(--vm-color-line)]"}`}>
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
    <div
      className={`orientation-message orientation-message--assistant max-w-[650px] ${
        animate ? "prospect-message-left" : ""
      }`}
    >
      <div className="mb-2.5 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
        <span className="orientation-message__brand grid h-7 w-7 place-items-center rounded-full">
          <Icon name="home" className="h-3.5 w-3.5" />
        </span>
        Vivienda Colsubsidio
      </div>
      <div className="orientation-assistant-bubble whitespace-pre-line px-5 py-4 text-[15px] leading-7">
        {children}
      </div>
    </div>
  );
}

function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="orientation-message orientation-message--user ml-auto max-w-[580px]">
      <div className="orientation-user-bubble whitespace-pre-line px-5 py-4 text-[15px] font-semibold leading-7 text-white">
        {children}
      </div>
      <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-[color:var(--vm-color-ink-muted)]">
        <Icon
          name="check"
          className="h-3 w-3 text-[color:var(--vm-color-success)]"
        />
        Enviado
      </div>
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
        className={`orientation-user-bubble whitespace-pre-line px-5 py-4 text-[15px] font-semibold leading-7 text-white ${
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
      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold text-[color:var(--vm-color-brand-blue)]">
        <span className="orientation-message__brand grid h-6 w-6 place-items-center rounded-full">
          <Icon name="home" className="h-3 w-3" />
        </span>
        Vivienda Colsubsidio está escribiendo…
      </div>
      <div
        className="orientation-typing-bubble px-4 py-3"
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
      className="orientation-experience"
    >
      <OrientationHeader status="Recuperando conversación" />
      <main className="mx-auto grid max-w-[1120px] gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,760px)] lg:px-8 lg:py-10">
        <div className="hidden lg:block">
          <HousingWindow compact />
        </div>
        <div className="space-y-5">
          <div className="h-24 w-[82%] animate-pulse rounded-[8px_24px_24px_24px] bg-white" />
          <div className="ml-auto h-20 w-[66%] animate-pulse rounded-[24px_8px_24px_24px] bg-[color:var(--vm-color-brand-blue)]/12" />
          <div className="h-28 w-[88%] animate-pulse rounded-[8px_24px_24px_24px] bg-white" />
        </div>
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
    <div className="orientation-experience">
      <OrientationHeader
        status={tone === "error" ? "Requiere atención" : "Orientación"}
      />
      <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-[980px] place-items-center gap-8 px-5 py-10 lg:grid-cols-[.8fr_1.2fr]">
        <div className="hidden w-full lg:block">
          <HousingWindow compact />
        </div>
      <section className="orientation-result-hero w-full max-w-xl p-8 text-center sm:p-10">
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
      </main>
    </div>
  );
}

function createMessageId(sessionId: string): string {
  return `${sessionId}-${crypto.randomUUID()}`;
}
