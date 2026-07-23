import type { ConversationSession } from "./domain";

const SESSIONS_KEY = "vivienda-match-ai:demo-sessions:v2";
const CURRENT_SESSION_KEY = "vivienda-match-ai:current-session:v2";

function readSessions(): ConversationSession[] {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(SESSIONS_KEY);
    return value ? (JSON.parse(value) as ConversationSession[]) : [];
  } catch {
    return [];
  }
}

export function getStoredSessions(): ConversationSession[] {
  return readSessions();
}

export function saveSession(session: ConversationSession): void {
  const sessions = readSessions().filter((stored) => stored.id !== session.id);
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify([session, ...sessions].slice(0, 10)));
  window.localStorage.setItem(CURRENT_SESSION_KEY, session.id);
}

export function loadSession(id: string): ConversationSession | undefined {
  return readSessions().find((session) => session.id === id);
}

export function findSessionByLeadId(leadId: string): ConversationSession | undefined {
  return readSessions().find((session) => session.leadId === leadId);
}

export function getRecoverableSession(): ConversationSession | undefined {
  if (typeof window === "undefined") return undefined;
  const currentId = window.localStorage.getItem(CURRENT_SESSION_KEY);
  return currentId ? loadSession(currentId) : undefined;
}
