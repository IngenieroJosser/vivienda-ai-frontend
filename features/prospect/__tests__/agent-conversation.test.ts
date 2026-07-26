import { describe, expect, it } from "vitest";
import type { AgentConversationResponse } from "../../../lib/api/conversations";
import { campaignExperiences, sanitizeAcquisitionContext } from "../campaigns";
import {
  applyAgentSnapshot,
  mapAgentResponseToEvaluation,
} from "../agent-conversation";
import { acceptProspectConsent, createProspectSession } from "../engine";

function response(): AgentConversationResponse {
  return {
    lead_id: "lead-server",
    session_id: "snapshot-session",
    external_turn_id: null,
    assistant_message: "Construyamos una meta de ahorro realista.",
    conversation_state: "NURTURE_COACHING",
    next_action: "monthlySavingsGoal",
    quick_replies: ["Puedo ahorrar cada mes"],
    extracted_fields: [],
    profile: {
      affiliation: "AFFILIATE",
      incomeRange: "MID",
      savings: "NONE",
    },
    discovery: {
      housingVision: "Vivienda para mi hija y para mí",
    },
    journey: {
      lead_id: "lead-server",
      session_id: "snapshot-session",
      session_version: 8,
      persisted: true,
      readiness: {
        level: "DEVELOPING",
        factors: ["Afiliación confirmada"],
        blockers: ["Ahorro por construir"],
        missing_fields: [],
      },
      route: "FINANCIAL_PREPARATION",
      capacity: {
        estimated_amount: 180_000_000,
        estimated_monthly_payment: 1_500_000,
        disclaimer: "Estimación orientativa.",
      },
      nurture_plan: {
        primary_gap: "Ahorro para cuota inicial",
        target_amount: 20_000_000,
        review_date: "2026-10-26",
        status: "ACTIVE",
        intervention_required: false,
        milestones: [],
      },
      recommendations: [],
      regulatory: null,
      handoff: {
        requested: false,
        status: "NOT_REQUESTED",
        channel: null,
        time_preference: null,
        requested_at: null,
        project_ids: [],
        next_action: "Definir meta de ahorro",
      },
      evaluated_at: "2026-07-26T02:00:00.000Z",
    },
    readiness_score: 55,
    confidence_score: 85,
    priority: "LOW",
    agent_mode: "DETERMINISTIC_FALLBACK",
    agent_usage: {
      requests: 0,
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      latency_ms: 2,
    },
    regulatory: {
      mode: "DEMO",
      status: "AVAILABLE",
      affiliate_sales: 90,
      non_affiliate_sales: 8,
      total_sales: 98,
      non_affiliate_share: 0.0816,
      non_affiliate_limit: 0.1,
      available_non_affiliate_slots: 2,
      can_continue: true,
      period: "DEMO",
    },
    continue_conversation: true,
    completed: false,
    training_record_id: null,
    prompt_version: "housing-agent-3.0.0",
    model_name: "gpt-5.4-mini",
    generated_at: "2026-07-26T02:00:00.000Z",
    prospect_access_token: "prospect-token",
  };
}

describe("agent conversation snapshot", () => {
  it("refreshes the authoritative action without losing visible turns", () => {
    const base = acceptProspectConsent(
      createProspectSession({
        id: "snapshot-session",
        acquisition: sanitizeAcquisitionContext({
          utm_campaign: "versalles_proyecto",
        }),
        campaign: campaignExperiences.versalles,
        timestamp: "2026-07-26T01:00:00.000Z",
      }),
      "2026-07-26T01:00:01.000Z",
    );
    const session = {
      ...base,
      agentWelcomeMessage: "Hablemos de Versalles.",
      nextAction: "incomeRange" as const,
      turns: [
        {
          id: "turn-1",
          userText: "Entre 3 y 7 millones",
          assistantText: "Gracias por compartir el rango.",
          extractedFields: ["incomeRange" as const],
          createdAt: "2026-07-26T01:01:00.000Z",
        },
      ],
    };

    const synchronized = applyAgentSnapshot(session, response());

    expect(synchronized.nextAction).toBe("monthlySavingsGoal");
    expect(synchronized.answers.incomeRange).toBe("MID");
    expect(synchronized.turns).toEqual(session.turns);
    expect(synchronized.agentWelcomeMessage).toBe("Hablemos de Versalles.");
    expect(synchronized.syncVersion).toBe(8);
    expect(synchronized.prospectAccessToken).toBe("prospect-token");
    expect(
      mapAgentResponseToEvaluation(response(), synchronized).confidenceScore,
    ).toBe(0.85);
    expect("quickReplies" in synchronized).toBe(false);
  });
});
