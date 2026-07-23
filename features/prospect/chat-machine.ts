export const CHAT_MESSAGE_MAX_LENGTH = 600;
export const CHAT_COUNTER_THRESHOLD = 0.8;

export type ChatPhase =
  | "idle"
  | "validating"
  | "sending"
  | "waiting"
  | "typing"
  | "answered"
  | "failed";

export type OutgoingMessage = {
  id: string;
  text: string;
  delivery: "sending" | "sent" | "failed";
};

export type ChatState =
  | { phase: "idle"; validationError?: string }
  | {
      phase: "validating" | "sending";
      outgoing: OutgoingMessage & { delivery: "sending" };
    }
  | {
      phase: "waiting" | "typing";
      outgoing: OutgoingMessage & { delivery: "sent" };
    }
  | { phase: "answered" }
  | {
      phase: "failed";
      outgoing: OutgoingMessage & { delivery: "failed" };
      error: string;
    };

export type ChatEvent =
  | { type: "SUBMIT"; id: string; rawMessage: string }
  | { type: "VALIDATED" }
  | { type: "SENT" }
  | { type: "TYPING_STARTED" }
  | { type: "ANSWER_RECEIVED" }
  | { type: "FAILED"; error: string }
  | { type: "RETRY" }
  | { type: "RESET" };

export const initialChatState: ChatState = { phase: "idle" };

export function chatReducer(
  state: ChatState,
  event: ChatEvent,
): ChatState {
  switch (event.type) {
    case "SUBMIT": {
      if (state.phase !== "idle") return state;
      const validation = validateChatMessage(event.rawMessage);
      if (!validation.valid) {
        return { phase: "idle", validationError: validation.error };
      }
      return {
        phase: "validating",
        outgoing: {
          id: event.id,
          text: validation.message,
          delivery: "sending",
        },
      };
    }
    case "VALIDATED":
      return state.phase === "validating"
        ? { phase: "sending", outgoing: state.outgoing }
        : state;
    case "SENT":
      return state.phase === "sending"
        ? {
            phase: "waiting",
            outgoing: { ...state.outgoing, delivery: "sent" },
          }
        : state;
    case "TYPING_STARTED":
      return state.phase === "waiting"
        ? { phase: "typing", outgoing: state.outgoing }
        : state;
    case "ANSWER_RECEIVED":
      return state.phase === "typing" ? { phase: "answered" } : state;
    case "FAILED":
      return hasOutgoing(state)
        ? {
            phase: "failed",
            outgoing: { ...state.outgoing, delivery: "failed" },
            error: event.error,
          }
        : state;
    case "RETRY":
      return state.phase === "failed"
        ? {
            phase: "sending",
            outgoing: { ...state.outgoing, delivery: "sending" },
          }
        : state;
    case "RESET":
      return state.phase === "answered" ? initialChatState : state;
    default:
      return state;
  }
}

export function validateChatMessage(
  rawMessage: string,
  maxLength = CHAT_MESSAGE_MAX_LENGTH,
):
  | { valid: true; message: string }
  | { valid: false; error: string } {
  const message = rawMessage.trim();
  if (!message) {
    return { valid: false, error: "Escribe un mensaje antes de enviarlo." };
  }
  if (rawMessage.length > maxLength) {
    return {
      valid: false,
      error: `El mensaje puede tener máximo ${maxLength} caracteres.`,
    };
  }
  return { valid: true, message };
}

export function canSubmitChatMessage(state: ChatState, message: string): boolean {
  return state.phase === "idle" && validateChatMessage(message).valid;
}

export function shouldShowCharacterCounter(
  length: number,
  maxLength = CHAT_MESSAGE_MAX_LENGTH,
): boolean {
  return length >= Math.floor(maxLength * CHAT_COUNTER_THRESHOLD);
}

export function isNearConversationEnd(input: {
  scrollTop: number;
  viewportHeight: number;
  contentHeight: number;
  threshold?: number;
}): boolean {
  return (
    input.contentHeight - (input.scrollTop + input.viewportHeight) <=
    (input.threshold ?? 160)
  );
}

export function getChatTransitionDelay(
  phase: ChatPhase,
  reducedMotion: boolean,
): number {
  if (reducedMotion) return 0;
  const delays: Partial<Record<ChatPhase, number>> = {
    validating: 0,
    sending: 180,
    waiting: 160,
    typing: 520,
    answered: 240,
  };
  return delays[phase] ?? 0;
}

export function getTextareaHeight(input: {
  scrollHeight: number;
  minHeight?: number;
  lineHeight?: number;
  maxLines?: number;
  verticalPadding?: number;
}): number {
  const minHeight = input.minHeight ?? 52;
  const maximum =
    (input.lineHeight ?? 24) * (input.maxLines ?? 5) +
    (input.verticalPadding ?? 24);
  return Math.min(maximum, Math.max(minHeight, input.scrollHeight));
}

export function scheduleChatTransition(
  callback: () => void,
  delay: number,
): () => void {
  const timer = globalThis.setTimeout(callback, delay);
  return () => globalThis.clearTimeout(timer);
}

function hasOutgoing(
  state: ChatState,
): state is Exclude<ChatState, { phase: "idle" | "answered" }> {
  return "outgoing" in state;
}
