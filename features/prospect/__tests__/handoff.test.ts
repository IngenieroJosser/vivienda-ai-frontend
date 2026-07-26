import { describe, expect, it } from "vitest";
import { campaignExperiences, sanitizeAcquisitionContext } from "../campaigns";
import {
  contactChannelLabels,
  createContactRequest,
  isEligibleForContactRequest,
  validateContactRequest,
} from "../handoff";
import {
  acceptProspectConsent,
  answerProspectMessage,
  createProspectSession,
} from "../engine";

function createQualifiedSession() {
  let session = createProspectSession({
    id: "handoff-session",
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
    "Quiero saber si la cuota me alcanza, quiero dejar de pagar arriendo y ya tengo una base de ahorro.",
    "2026-07-23T12:01:00.000Z",
  );
  return answerProspectMessage(
    session,
    "No tengo deudas y quiero comprar entre 3 y 6 meses.",
    "2026-07-23T12:02:00.000Z",
  );
}

describe("prospect commercial handoff", () => {
  it("requires channel, time preference and both authorizations", () => {
    expect(
      validateContactRequest({
        channel: "" as never,
        timePreference: "" as never,
        authorizesContact: false,
        authorizesInformationSharing: false,
      }),
    ).toEqual({
      channel: "Elige cómo prefieres que te contacten.",
      timePreference: "Elige una franja de contacto.",
      authorizations:
        "Necesitamos ambas autorizaciones para enviar tu solicitud al equipo de vivienda.",
    });
  });

  it("creates an idempotent request from the evaluated session", () => {
    const session = createQualifiedSession();
    expect(isEligibleForContactRequest(session)).toBe(true);

    const preferences = {
      channel: "WHATSAPP" as const,
      timePreference: "WEEKDAY_MORNING" as const,
      authorizesContact: true,
      authorizesInformationSharing: true,
    };
    const first = createContactRequest({
      session,
      preferences,
      timestamp: "2026-07-23T12:03:00.000Z",
    });
    const retried = createContactRequest({
      session,
      preferences: { ...preferences, channel: "PHONE" },
      timestamp: "2026-07-23T12:04:00.000Z",
      existing: first,
    });

    expect(first.id).toBe("contact-handoff-session");
    expect(retried.id).toBe(first.id);
    expect(retried.createdAt).toBe(first.createdAt);
    expect(retried.channel).toBe("PHONE");
    expect(retried.projectIds).toEqual(
      session.evaluation?.projectMatches.map(({ projectId }) => projectId),
    );
    expect(contactChannelLabels[retried.channel]).toBe("Llamada");
  });

  it("does not enable contact before qualification", () => {
    const session = createProspectSession({
      id: "unfinished",
      acquisition: sanitizeAcquisitionContext({ utm_campaign: "general" }),
      campaign: campaignExperiences.general,
      timestamp: "2026-07-23T12:00:00.000Z",
    });

    expect(isEligibleForContactRequest(session)).toBe(false);
    expect(() =>
      createContactRequest({
        session,
        preferences: {
          channel: "EMAIL",
          timePreference: "ANY",
          authorizesContact: true,
          authorizesInformationSharing: true,
        },
        timestamp: "2026-07-23T12:01:00.000Z",
      }),
    ).toThrow("La sesión no está habilitada para contacto comercial.");
  });
});
