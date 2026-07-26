import { syncProspectSession } from "../../lib/api/leads";
import type { ProspectSession } from "./domain";

const SESSIONS_KEY = "vivienda-match-ai:prospect-sessions:v6";
const SYNC_TIMEOUT_MS = 6_000;
const pendingSyncs = new Map<string, ProspectSession>();
const activeSyncs = new Set<string>();

export type ProspectSessionLoadResult =
  | { status: "FOUND"; session: ProspectSession }
  | { status: "MISSING" }
  | { status: "ERROR" };

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

function writeSessionLocally(session: ProspectSession): void {
  const sessions = readSessions().filter((stored) => stored.id !== session.id);
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify([session, ...sessions].slice(0, 12)));
}

export function saveProspectSessionLocalOnly(session: ProspectSession): void {
  if (typeof window === "undefined") return;
  writeSessionLocally(session);
}

export function saveProspectSession(session: ProspectSession): void {
  if (typeof window === "undefined") return;

  if (!session.consentAcceptedAt) {
    writeSessionLocally(session);
    return;
  }
  const stored = readSessions().find((candidate) => candidate.id === session.id);
  const versionedSession = {
    ...session,
    syncVersion: Math.max(session.syncVersion ?? 0, stored?.syncVersion ?? 0) + 1,
    syncStatus: "PENDING" as const,
  };
  writeSessionLocally(versionedSession);

  pendingSyncs.set(versionedSession.id, versionedSession);
  void flushSessionSync(versionedSession.id);
}

async function flushSessionSync(sessionId: string): Promise<void> {
  if (activeSyncs.has(sessionId)) return;
  const session = pendingSyncs.get(sessionId);
  if (!session) return;

  pendingSyncs.delete(sessionId);
  activeSyncs.add(sessionId);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

  try {
    const response = await syncProspectSession(session, controller.signal);
    const current = loadProspectSession(sessionId);
    if (current) {
      writeSessionLocally({
        ...current,
        leadId: response.lead_id,
        syncStatus: "SYNCED",
        // La API conversacional es la fuente oficial del journey del agente.
        // El endpoint legado de sincronización solo confirma persistencia.
      });
    }
  } catch {
    pendingSyncs.delete(sessionId);
    const current = loadProspectSession(sessionId);
    if (current) {
      writeSessionLocally({ ...current, syncStatus: "PENDING" });
      if ("addEventListener" in window) {
        window.addEventListener(
          "online",
          () => {
            const pending = loadProspectSession(sessionId);
            if (!pending || pending.syncStatus !== "PENDING") return;
            pendingSyncs.set(sessionId, pending);
            void flushSessionSync(sessionId);
          },
          { once: true },
        );
      }
    }
  } finally {
    window.clearTimeout(timeoutId);
    activeSyncs.delete(sessionId);
    if (pendingSyncs.has(sessionId)) {
      void flushSessionSync(sessionId);
    }
  }
}

export function loadProspectSession(id: string): ProspectSession | undefined {
  return readSessions().find((session) => session.id === id);
}

export function loadProspectSessionResult(
  id: string,
): ProspectSessionLoadResult {
  if (typeof window === "undefined") return { status: "MISSING" };
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    if (!raw) return { status: "MISSING" };
    const sessions = JSON.parse(raw) as unknown;
    if (!Array.isArray(sessions)) return { status: "ERROR" };
    const session = (sessions as ProspectSession[]).find(
      (candidate) => candidate.id === id,
    );
    return session ? { status: "FOUND", session } : { status: "MISSING" };
  } catch {
    return { status: "ERROR" };
  }
}

export function findProspectSessionByLeadId(leadId: string): ProspectSession | undefined {
  return readSessions().find(
    (session) => session.leadId === leadId || session.evaluation?.leadId === leadId,
  );
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
