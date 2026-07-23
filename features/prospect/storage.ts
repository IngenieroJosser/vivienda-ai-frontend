import type { ProspectSession } from "./domain";

const SESSIONS_KEY = "vivienda-match-ai:prospect-sessions:v4";

function readSessions(): ProspectSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as ProspectSession[]) : [];
  } catch {
    return [];
  }
}

export function getStoredProspectSessions(): ProspectSession[] {
  return readSessions();
}

export function saveProspectSession(session: ProspectSession): void {
  const sessions = readSessions().filter((stored) => stored.id !== session.id);
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify([session, ...sessions].slice(0, 12)));
}

export function loadProspectSession(id: string): ProspectSession | undefined {
  return readSessions().find((session) => session.id === id);
}

export function findProspectSessionByLeadId(leadId: string): ProspectSession | undefined {
  return readSessions().find((session) => session.evaluation?.leadId === leadId);
}

export function findRecoverableProspectSession(input: {
  leadReference?: string;
  campaign: string;
}): ProspectSession | undefined {
  return readSessions().find((session) => {
    if (session.status === "DECLINED") return false;
    if (input.leadReference) return session.leadReference === input.leadReference;
    return session.acquisition.campaign === input.campaign;
  });
}
