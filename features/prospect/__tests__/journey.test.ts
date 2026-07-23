import { describe, expect, it } from "vitest";
import { createFunnelEvent, summarizeFunnelByCampaign } from "../analytics";
import {
  campaignExperiences,
  resolveCampaignExperience,
  sanitizeAcquisitionContext,
  sanitizeFirstName,
} from "../campaigns";
import {
  acceptProspectConsent,
  answerProspectQuestion,
  createProspectSession,
  getCapacityRange,
  MAX_PUBLIC_DECISIONS,
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

  it("completes consent plus five profile decisions and produces a deterministic result", () => {
    const campaign = campaignExperiences.versalles;
    let session = createProspectSession({
      id: "public-session",
      firstName: "Ana",
      acquisition,
      campaign,
      timestamp: "2026-07-23T12:00:00.000Z",
    });
    session = acceptProspectConsent(session, "2026-07-23T12:00:01.000Z");

    expect(session.questionIds).toHaveLength(5);
    expect(session.questionIds.length + 1).toBe(MAX_PUBLIC_DECISIONS);

    for (const answer of ["AFFILIATE", "3_6", "MID", "LOW", "READY"]) {
      session = answerProspectQuestion(session, campaign, answer, "2026-07-23T12:01:00.000Z");
    }

    expect(session.status).toBe("COMPLETED");
    expect(session.evaluation?.profileSnapshot.location).toBe("SOACHA");
    expect(session.evaluation?.projectIds).toEqual(["versalles"]);
    expect(session.evaluation?.readinessScore).toBeGreaterThanOrEqual(75);
  });

  it("presents capacity as an orientation range instead of a single promise", () => {
    expect(getCapacityRange(1_200_000)).toEqual({
      minimum: 1_000_000,
      maximum: 1_400_000,
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
