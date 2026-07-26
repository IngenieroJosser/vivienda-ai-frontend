import { describe, expect, it } from "vitest";
import type { ProspectSession } from "../domain";
import { campaignExperiences, sanitizeAcquisitionContext } from "../campaigns";
import { acceptProspectConsent, createProspectSession } from "../engine";
import { toSessionSyncRequest } from "../../../lib/api/leads";

function createSession(): ProspectSession {
  const acquisition = sanitizeAcquisitionContext({
    utm_source: "Meta",
    utm_campaign: "Versalles_Familias",
    utm_content: "Video-01",
    leadId: "vm_D8fx20zQp4mN",
  });
  const session = acceptProspectConsent(
    createProspectSession({
      id: "session-sync-1",
      acquisition,
      campaign: campaignExperiences.versalles,
      timestamp: "2026-07-24T12:00:00.000Z",
    }),
    "2026-07-24T12:00:01.000Z",
  );

  return {
    ...session,
    firstName: "Prueba",
    customerRelationship: "AFFILIATE",
    knownProfile: { affiliation: "AFFILIATE", location: "SOACHA" },
    answers: { horizon: "0_3", savings: "READY" },
    discovery: { motivation: "Dejar de pagar arriendo" },
    turns: [
      {
        id: "session-sync-1-message-1",
        userText: "Busco vivienda para mi familia.",
        assistantText: "Cuéntame un poco más.",
        extractedFields: ["location"],
        createdAt: "2026-07-24T12:01:00.000Z",
      },
    ],
    updatedAt: "2026-07-24T12:01:00.000Z",
  };
}

describe("lead sync request mapping", () => {
  it("maps a ProspectSession to the backend snake_case contract", () => {
    const request = toSessionSyncRequest(createSession());

    expect(request).toMatchObject({
      session_id: "session-sync-1",
      session_version: 1,
      first_name: "Prueba",
      status: "ACTIVE",
      consent_accepted_at: "2026-07-24T12:00:01.000Z",
      customer_relationship: "AFFILIATE",
      acquisition: {
        source: "meta",
        campaign: "versalles_familias",
        content: "video-01",
        lead_reference: "vm_D8fx20zQp4mN",
        is_paid: true,
      },
      profile: {
        affiliation: "AFFILIATE",
        location: "SOACHA",
        horizon: "0_3",
        savings: "READY",
      },
      discovery: { motivation: "Dejar de pagar arriendo" },
      created_at: "2026-07-24T12:00:00.000Z",
      updated_at: "2026-07-24T12:01:00.000Z",
    });
    expect(request.turns).toEqual([
      {
        id: "session-sync-1-message-1",
        user_text: "Busco vivienda para mi familia.",
        assistant_text: "Cuéntame un poco más.",
        extracted_fields: ["location"],
        created_at: "2026-07-24T12:01:00.000Z",
      },
    ]);
    expect(request).not.toHaveProperty("frontend_evaluation");
  });
});
