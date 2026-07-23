import { describe, expect, it } from "vitest";
import { createFunnelEvent, summarizeFunnelByCampaign } from "../analytics";
import { getCapacityRange } from "../capacity";
import {
  campaignExperiences,
  resolveKnownProspect,
  resolveCampaignExperience,
  sanitizeAcquisitionContext,
} from "../campaigns";
import {
  acceptProspectConsent,
  answerProspectMessage,
  createProspectSession,
} from "../engine";
import { extractProspectSignals } from "../signal-extractor";

describe("paid acquisition prospect journey", () => {
  const acquisition = sanitizeAcquisitionContext({
    utm_source: "Meta",
    utm_campaign: "Versalles_Familias",
    utm_content: "Video-01",
    leadId: "vm_D8fx20zQp4mN",
  });

  it("preserves sanitized attribution and accepts only opaque lead references", () => {
    expect(acquisition).toEqual({
      source: "meta",
      campaign: "versalles_familias",
      content: "video-01",
      leadReference: "vm_D8fx20zQp4mN",
    });
    expect(sanitizeAcquisitionContext({ leadId: "lead-jonathan<script>" }).leadReference).toBeUndefined();
    expect(resolveCampaignExperience(acquisition.campaign).id).toBe("versalles");
  });

  it("extracts several profile signals from one natural-language response", () => {
    const extraction = extractProspectSignals(
      "Busco algo para vivir con mi hija en Soacha, pero me preocupa no tener suficiente para la cuota inicial.",
      "OPEN_DISCOVERY",
    );

    expect(extraction.profile).toMatchObject({
      dreamGoal: "BUY_THIS_YEAR",
      householdSize: "2",
      location: "SOACHA",
      mainConcern: "PAYMENT",
      savings: "NONE",
    });
    expect(extraction.fields.length).toBeGreaterThanOrEqual(5);
  });

  it("reflects what was understood and stops as soon as evidence is sufficient", () => {
    let session = createProspectSession({
      id: "jonathan-conversation",
      acquisition: sanitizeAcquisitionContext({
        utm_campaign: "versalles",
        leadId: "vm_Jonathan30X1",
      }),
      campaign: campaignExperiences.versalles,
      timestamp: "2026-07-23T12:00:00.000Z",
    });
    session = acceptProspectConsent(session, "2026-07-23T12:00:01.000Z");
    session = answerProspectMessage(
      session,
      "Busco algo para vivir con mi hija porque quiero dejar de pagar arriendo, pero me preocupa no tener suficiente para la cuota inicial.",
      "2026-07-23T12:01:00.000Z",
    );

    expect(session.status).toBe("ACTIVE");
    expect(session.nextAction).toBe("obligations");
    expect(session.turns[0]?.assistantText).toContain("dos personas");
    expect(session.turns[0]?.extractedFields).toEqual(expect.arrayContaining(["householdSize", "mainConcern", "savings"]));

    session = answerProspectMessage(
      session,
      "Necesito entender mi capacidad. No tengo deudas y quisiera comprar entre 3 y 6 meses.",
      "2026-07-23T12:02:00.000Z",
    );

    expect(session.status).toBe("COMPLETED");
    expect(session.turns).toHaveLength(2);
    expect(session.evaluation?.route).toBe("NURTURE_FINANCIAL");
  });

  it("reacts differently to different free-text answers", () => {
    const createAnonymous = (id: string) => acceptProspectConsent(createProspectSession({
      id,
      acquisition: sanitizeAcquisitionContext({ utm_campaign: "general" }),
      campaign: campaignExperiences.general,
      timestamp: "2026-07-23T12:00:00.000Z",
    }), "2026-07-23T12:00:01.000Z");

    const vague = answerProspectMessage(
      createAnonymous("vague"),
      "Quiero entender mejor mis opciones.",
      "2026-07-23T12:01:00.000Z",
    );
    const detailed = answerProspectMessage(
      createAnonymous("detailed"),
      "Busco en Soacha para vivir con mi hija porque quiero dejar de pagar arriendo y todavía no tengo ahorro.",
      "2026-07-23T12:01:00.000Z",
    );

    expect(vague.nextAction).toBe("DISCOVER_MOTIVATION");
    expect(detailed.nextAction).toBe("incomeRange");
    expect(vague.turns[0]?.assistantText).not.toBe(detailed.turns[0]?.assistantText);
    expect(detailed.turns[0]?.extractedFields.length).toBeGreaterThan(vague.turns[0]?.extractedFields.length ?? 0);
  });

  it("keeps unknown visitors anonymous until explicit consent", () => {
    const session = createProspectSession({
      id: "anonymous-session",
      acquisition: sanitizeAcquisitionContext({ utm_campaign: "versalles" }),
      campaign: campaignExperiences.versalles,
      timestamp: "2026-07-23T12:00:00.000Z",
    });

    expect(session.firstName).toBeUndefined();
    expect(session.status).toBe("CONSENT");
    expect(session.consentAcceptedAt).toBeUndefined();
    expect(session.turns).toEqual([]);
    expect(resolveKnownProspect("unknown")).toBeUndefined();
  });

  it("runs the three jury profiles through variable-length public conversations", () => {
    const cases = [
      {
        leadId: "vm_Jonathan30X1",
        campaign: campaignExperiences.versalles,
        messages: [
          "Quiero saber si la cuota me alcanza, quiero dejar de pagar arriendo y ya tengo una base de ahorro.",
          "No tengo deudas y quiero comprar entre 3 y 6 meses.",
        ],
        expectedRoute: "ADVISOR_NOW",
      },
      {
        leadId: "vm_Laura30X2026",
        campaign: campaignExperiences.general,
        messages: [
          "Necesito espacio para mi esposo y dos hijos en Soacha porque nuestra familia necesita más espacio; quiero comprar este año, ya tengo ahorro y necesito entender qué proyecto nos conviene.",
          "Recibimos más de 4 salarios mínimos y no tengo deudas.",
        ],
        expectedRoute: "NON_AFFILIATE_PRIORITY",
      },
      {
        leadId: "vm_Camila30X2026",
        campaign: campaignExperiences.cuota,
        messages: [
          "Me interesa Soacha para vivir con mi hija porque quiero dejar de pagar arriendo. Necesito entender si mi ingreso alcanza; recibimos entre 2 y 4 salarios y tengo algunas deudas.",
        ],
        expectedRoute: "NURTURE_FINANCIAL",
      },
    ] as const;

    const turnCounts = cases.map(({ leadId, campaign, messages, expectedRoute }) => {
      let session = acceptProspectConsent(createProspectSession({
        id: `session-${leadId}`,
        acquisition: sanitizeAcquisitionContext({ utm_campaign: campaign.id, leadId }),
        campaign,
        timestamp: "2026-07-23T12:00:00.000Z",
      }), "2026-07-23T12:00:01.000Z");

      for (const message of messages) {
        session = answerProspectMessage(session, message, "2026-07-23T12:01:00.000Z");
      }

      expect(session.status).toBe("COMPLETED");
      expect(session.evaluation?.route).toBe(expectedRoute);
      return session.turns.length;
    });

    expect(new Set(turnCounts).size).toBeGreaterThan(1);
  });

  it("does not transfer to a human before commercial qualification", () => {
    let session = acceptProspectConsent(createProspectSession({
      id: "human-handoff",
      acquisition,
      campaign: campaignExperiences.versalles,
      timestamp: "2026-07-23T12:00:00.000Z",
    }), "2026-07-23T12:00:01.000Z");

    session = answerProspectMessage(session, "Prefiero hablar con un asesor.", "2026-07-23T12:01:00.000Z");

    expect(session.status).toBe("ACTIVE");
    expect(session.nextAction).toBe("DISCOVER_MOTIVATION");
    expect(session.turns).toHaveLength(1);
    expect(session.turns[0]?.assistantText).toContain("Primero confirmemos");
  });

  it("presents capacity as a prudent range below the deterministic maximum", () => {
    expect(getCapacityRange(1_200_000)).toEqual({
      minimum: 1_000_000,
      maximum: 1_200_000,
    });
    expect(getCapacityRange(0)).toBeUndefined();
  });

  it("creates campaign-attributed funnel events without personal data", () => {
    const event = createFunnelEvent({
      name: "QUESTION_ABANDONED",
      acquisition,
      sessionId: "public-session",
      questionId: "incomeRange",
      occurredAt: "2026-07-23T12:03:00.000Z",
    });

    expect(event.campaign).toBe("versalles_familias");
    expect(event.questionId).toBe("incomeRange");
    expect(event).not.toHaveProperty("firstName");
    expect(event).not.toHaveProperty("leadReference");
  });

  it("calculates conversion by campaign from the same funnel events", () => {
    const names = [
      "PAID_ARRIVAL",
      "CONVERSATION_STARTED",
      "CONSENT_ACCEPTED",
      "PROFILING_COMPLETED",
      "RESULT_VIEWED",
      "NEXT_ACTION_CLICKED",
    ] as const;
    const events = names.map((name) => createFunnelEvent({
      name,
      acquisition,
      occurredAt: "2026-07-23T12:00:00.000Z",
    }));

    expect(summarizeFunnelByCampaign(events).versalles_familias).toMatchObject({
      arrivals: 1,
      completions: 1,
      nextActions: 1,
      completionRate: 1,
    });
  });
});
