const ENTRY_MESSAGE_KEY = "vivienda-match:pending-entry-message";
const SESSION_MESSAGE_PREFIX = "vivienda-match:pending-session-message:";
const MAX_MESSAGE_AGE_MS = 30 * 60 * 1000;

type PendingMessage = {
  message: string;
  createdAt: number;
};

export function stageEntryMessage(rawMessage: string): void {
  if (typeof window === "undefined") return;
  const message = sanitize(rawMessage);
  if (!message) return;

  const pending: PendingMessage = {
    message,
    createdAt: Date.now(),
  };
  window.sessionStorage.setItem(ENTRY_MESSAGE_KEY, JSON.stringify(pending));
}

export function hasStagedEntryMessage(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(readPending(window.sessionStorage.getItem(ENTRY_MESSAGE_KEY)));
}

export function bindEntryMessageToSession(sessionId: string): void {
  if (typeof window === "undefined") return;
  const pending = readPending(window.sessionStorage.getItem(ENTRY_MESSAGE_KEY));
  window.sessionStorage.removeItem(ENTRY_MESSAGE_KEY);
  if (!pending) return;
  window.sessionStorage.setItem(`${SESSION_MESSAGE_PREFIX}${sessionId}`, JSON.stringify(pending));
}

export function takeSessionMessage(sessionId: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const key = `${SESSION_MESSAGE_PREFIX}${sessionId}`;
  const pending = readPending(window.sessionStorage.getItem(key));
  window.sessionStorage.removeItem(key);
  return pending?.message;
}

function readPending(raw: string | null): PendingMessage | undefined {
  if (!raw) return undefined;
  try {
    const candidate = JSON.parse(raw) as Partial<PendingMessage>;
    if (
      typeof candidate.message !== "string"
      || typeof candidate.createdAt !== "number"
      || Date.now() - candidate.createdAt > MAX_MESSAGE_AGE_MS
    ) return undefined;

    const message = sanitize(candidate.message);
    return message ? { message, createdAt: candidate.createdAt } : undefined;
  } catch {
    return undefined;
  }
}

function sanitize(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, 600);
}
