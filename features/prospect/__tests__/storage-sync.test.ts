import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionSyncResponse } from "../../../lib/api/leads";
import { campaignExperiences, sanitizeAcquisitionContext } from "../campaigns";
import { acceptProspectConsent, createProspectSession } from "../engine";

const { syncProspectSession } = vi.hoisted(() => ({
  syncProspectSession: vi.fn(),
}));

vi.mock("../../../lib/api/leads", () => ({ syncProspectSession }));

import {
  findProspectSessionByLeadId,
  loadProspectSession,
  saveProspectSession,
} from "../storage";

function createSession(id = "storage-sync-1") {
  return acceptProspectConsent(
    createProspectSession({
      id,
      acquisition: sanitizeAcquisitionContext({ utm_campaign: "versalles" }),
      campaign: campaignExperiences.versalles,
      timestamp: "2026-07-24T12:00:00.000Z",
    }),
    "2026-07-24T12:00:01.000Z",
  );
}

function installLocalStorage() {
  const values = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage,
      setTimeout,
      clearTimeout,
    },
  });
  return values;
}

function syncResponse(sessionId: string): SessionSyncResponse {
  return {
    lead_id: "server-lead-1",
    session_id: sessionId,
    persisted: true,
    evaluation: {
      lead_id: "server-lead-1",
      readiness_score: 74,
      confidence_score: 80,
      route: "NEEDS_VALIDATION",
      priority: "MEDIUM",
      reason_codes: ["PROFILE_INCOMPLETE"],
      blockers: ["MISSING_INCOME"],
      next_action: "Completar perfil",
      capacity: {
        monthly_income_estimate: 0,
        commitment_ratio: 0,
        maximum_housing_ratio: 0,
        estimated_housing_payment: 0,
        status: "UNKNOWN",
      },
      recommendations: [],
      latency_ms: 12,
      audit: {
        rule_version: "rules-1.1.0",
        model_version: "affinity-1.0.0",
        prompt_version: "conversation-1.0.0",
        evaluated_at: "2026-07-24T12:00:02.000Z",
      },
    },
  };
}

async function flushPromises() {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("prospect session backend sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installLocalStorage();
  });

  it("keeps the local write and merges the backend lead and evaluation", async () => {
    const session = createSession();
    const localEvaluation = { leadId: "lead-local", route: "ADVISOR_NOW" };
    const sessionWithEvaluation = { ...session, evaluation: localEvaluation } as typeof session & {
      evaluation: typeof localEvaluation;
    };
    syncProspectSession.mockResolvedValue(syncResponse(session.id));

    saveProspectSession(sessionWithEvaluation);

    expect(loadProspectSession(session.id)).toMatchObject({
      id: session.id,
      evaluation: localEvaluation,
    });
    await flushPromises();

    const stored = loadProspectSession(session.id);
    expect(syncProspectSession).toHaveBeenCalledTimes(1);
    expect(stored).toMatchObject({
      leadId: "server-lead-1",
      evaluation: localEvaluation,
      backendEvaluation: {
        route: "NEEDS_VALIDATION",
        recommendations: [],
      },
    });
    expect(findProspectSessionByLeadId("server-lead-1")?.id).toBe(session.id);
  });

  it("does not remove the local session when the backend is unavailable", async () => {
    const session = createSession("storage-fallback-1");
    syncProspectSession.mockRejectedValue(new Error("backend unavailable"));

    saveProspectSession(session);
    await flushPromises();

    expect(loadProspectSession(session.id)).toEqual(session);
  });

  it("does not send session data before consent is accepted", async () => {
    const session = createProspectSession({
      id: "storage-without-consent",
      acquisition: sanitizeAcquisitionContext({ utm_campaign: "versalles" }),
      campaign: campaignExperiences.versalles,
      timestamp: "2026-07-24T12:00:00.000Z",
    });

    saveProspectSession(session);
    await flushPromises();

    expect(loadProspectSession(session.id)).toEqual(session);
    expect(syncProspectSession).not.toHaveBeenCalled();
  });
});

export {};
