import { describe, expect, it } from "vitest";
import { createFunnelEvent, summarizeFunnelByCampaign } from "../analytics";
import {
  campaignExperiences,
  resolveKnownProspect,
  resolveCampaignExperience,
  sanitizeAcquisitionContext,
  sanitizeFirstName,
} from "../campaigns";
import {
  acceptProspectConsent,
  answerProspectQuestion,
  createProspectSession,
  getCapacityRange,
  selectPublicQuestions,
} from "../engine";

describe("paid acquisition prospect journey", () => {
  const acquisition = sanitizeAcquisitionContext({
    utm_source: "Meta",
    utm_campaign: "Versalles_Familias",
    utm_content: "Video-01",
    leadId: "vm_D8fx20zQp4mN",
  });

  it("preserves sanitized campaign attribution and accepts only opaque lead references", () => {
    expect(acquisition).toEqual({
      source: "meta",
      campaign: "versalles_familias",
      content: "video-01",
      leadReference: "vm_D8fx20zQp4mN",
    });
    expect(sanitizeAcquisitionContext({ leadId: "lead-jonathan<script>" }).leadReference).toBeUndefined();
    expect(resolveCampaignExperience(acquisition.campaign).id).toBe("versalles");
  });

  it("sanitizes the minimum identity without accepting markup or numbers", () => {
    expect(sanitizeFirstName("  Ana <script>123  María  ")).toBe("Ana script María");
  });

  it("uses known lead data and asks only the missing questions", () => {
    const campaign = campaignExperiences.versalles;
    const identifiedAcquisition = sanitizeAcquisitionContext({
      utm_source: "Meta",
      utm_campaign: "Versalles_Familias",
      utm_content: "Video-01",
      leadId: "vm_Jonathan30X1",
    });
    let session = createProspectSession({
      id: "public-session",
      acquisition: identifiedAcquisition,
      campaign,
      timestamp: "2026-07-23T12:00:00.000Z",
    });
    session = acceptProspectConsent(session, "2026-07-23T12:00:01.000Z");

    expect(session.firstName).toBe("Jonathan");
    expect(session.questionIds).toEqual(["mainConcern", "horizon", "obligations", "savings"]);

    for (const answer of ["PAYMENT", "3_6", "LOW", "READY"]) {
      session = answerProspectQuestion(session, answer, "2026-07-23T12:01:00.000Z");
    }

    expect(session.status).toBe("COMPLETED");
    expect(session.evaluation?.profileSnapshot.location).toBe("SOACHA");
    expect(session.evaluation?.projectIds).toEqual(["versalles"]);
    expect(session.evaluation?.readinessScore).toBeGreaterThanOrEqual(75);
  });

  it("keeps unknown visitors anonymous until consent and selects the missing profile fields", () => {
    const session = createProspectSession({
      id: "anonymous-session",
      acquisition: sanitizeAcquisitionContext({ utm_campaign: "versalles" }),
      campaign: campaignExperiences.versalles,
      timestamp: "2026-07-23T12:00:00.000Z",
    });

    expect(session.firstName).toBeUndefined();
    expect(session.status).toBe("CONSENT");
    expect(session.questionIds).not.toContain("location");
    expect(session.questionIds).toContain("affiliation");
    expect(selectPublicQuestions({ affiliation: "AFFILIATE" })).not.toContain("affiliation");
    expect(resolveKnownProspect("unknown")).toBeUndefined();
  });

  it("keeps the three internal jury journeys on distinct public routes", () => {
    const cases = [
      {
        leadId: "vm_Jonathan30X1",
        campaign: campaignExperiences.versalles,
        answers: ["PAYMENT", "3_6", "LOW", "READY"],
        expectedRoute: "ADVISOR_NOW",
      },
      {
        leadId: "vm_Laura30X2026",
        campaign: campaignExperiences.general,
        answers: ["SPACE", "SOACHA", "0_3", "2", "HIGH", "LOW", "READY"],
        expectedRoute: "NON_AFFILIATE_PRIORITY",
      },
      {
        leadId: "vm_Camila30X2026",
        campaign: campaignExperiences.cuota,
        answers: ["SOACHA", "3", "MID", "MEDIUM"],
        expectedRoute: "NURTURE_FINANCIAL",
      },
    ] as const;

    const routes = cases.map(({ leadId, campaign, answers, expectedRoute }) => {
      let session = createProspectSession({
        id: `session-${leadId}`,
        acquisition: sanitizeAcquisitionContext({ utm_campaign: campaign.id, leadId }),
        campaign,
        timestamp: "2026-07-23T12:00:00.000Z",
      });
      session = acceptProspectConsent(session, "2026-07-23T12:00:01.000Z");
      for (const answer of answers) {
        session = answerProspectQuestion(session, answer, "2026-07-23T12:01:00.000Z");
      }

      expect(session.status).toBe("COMPLETED");
      expect(session.evaluation?.route).toBe(expectedRoute);
      return session.evaluation?.route;
    });

    expect(new Set(routes).size).toBe(3);
  });

  it("presents capacity as an orientation range instead of a single promise", () => {
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
