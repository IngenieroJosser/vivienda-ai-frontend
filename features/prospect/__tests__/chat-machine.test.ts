import { afterEach, describe, expect, it, vi } from "vitest";
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
  type ChatState,
} from "../chat-machine";

afterEach(() => {
  vi.useRealTimers();
});

describe("human conversation state machine", () => {
  it("rejects empty and whitespace-only messages", () => {
    expect(validateChatMessage("   \n ")).toEqual({
      valid: false,
      error: "Escribe un mensaje antes de enviarlo.",
    });
    expect(canSubmitChatMessage(initialChatState, "   ")).toBe(false);
  });

  it("rejects content above the configured limit", () => {
    const result = validateChatMessage(
      "a".repeat(CHAT_MESSAGE_MAX_LENGTH + 1),
    );
    expect(result.valid).toBe(false);
  });

  it("shows the counter only near the character limit", () => {
    expect(shouldShowCharacterCounter(100)).toBe(false);
    expect(shouldShowCharacterCounter(480)).toBe(true);
  });

  it("prevents a second submission while processing", () => {
    const sending = chatReducer(initialChatState, {
      type: "SUBMIT",
      id: "message-1",
      rawMessage: "Quiero comprar una vivienda",
    });
    const duplicate = chatReducer(sending, {
      type: "SUBMIT",
      id: "message-2",
      rawMessage: "Quiero comprar una vivienda",
    });

    expect(duplicate).toEqual(sending);
  });

  it("enters and leaves the typing state in sequence", () => {
    const typing = reachTypingState();
    expect(typing.phase).toBe("typing");
    expect(chatReducer(typing, { type: "ANSWER_RECEIVED" })).toEqual({
      phase: "answered",
    });
  });

  it("preserves failed content and retries with the same identifier", () => {
    const typing = reachTypingState();
    const failed = chatReducer(typing, {
      type: "FAILED",
      error: "No se pudo enviar.",
    });
    const retried = chatReducer(failed, { type: "RETRY" });

    expect(failed.phase).toBe("failed");
    expect("outgoing" in failed && failed.outgoing.text).toBe(
      "Busco vivienda para mi familia",
    );
    expect(
      "outgoing" in retried && retried.outgoing.id,
    ).toBe("stable-message-id");
  });

  it("does not auto-scroll while the user reads older messages", () => {
    expect(
      isNearConversationEnd({
        scrollTop: 100,
        viewportHeight: 600,
        contentHeight: 1800,
      }),
    ).toBe(false);
    expect(
      isNearConversationEnd({
        scrollTop: 1050,
        viewportHeight: 600,
        contentHeight: 1750,
      }),
    ).toBe(true);
  });

  it("grows the textarea to five lines and returns to its minimum", () => {
    expect(getTextareaHeight({ scrollHeight: 220 })).toBe(144);
    expect(getTextareaHeight({ scrollHeight: 40 })).toBe(52);
  });

  it("removes non-essential delays with reduced motion", () => {
    expect(getChatTransitionDelay("sending", true)).toBe(0);
    expect(getChatTransitionDelay("typing", true)).toBe(0);
    expect(getChatTransitionDelay("sending", false)).toBe(180);
  });

  it("cancels pending timers before they update an unmounted view", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const cancel = scheduleChatTransition(callback, 500);

    cancel();
    vi.advanceTimersByTime(500);

    expect(callback).not.toHaveBeenCalled();
  });

  it("represents exactly one valid phase at a time", () => {
    const states: ChatState[] = [
      initialChatState,
      chatReducer(initialChatState, {
        type: "SUBMIT",
        id: "message",
        rawMessage: "Hola",
      }),
      reachTypingState(),
    ];

    for (const state of states) {
      expect(
        [
          "idle",
          "validating",
          "sending",
          "waiting",
          "typing",
          "answered",
          "failed",
        ],
      ).toContain(state.phase);
      expect(Object.keys(state).filter((key) => key === "phase")).toHaveLength(
        1,
      );
    }
  });
});

function reachTypingState(): ChatState {
  let state = chatReducer(initialChatState, {
    type: "SUBMIT",
    id: "stable-message-id",
    rawMessage: "Busco vivienda para mi familia",
  });
  state = chatReducer(state, { type: "VALIDATED" });
  state = chatReducer(state, { type: "SENT" });
  state = chatReducer(state, { type: "TYPING_STARTED" });
  return state;
}
