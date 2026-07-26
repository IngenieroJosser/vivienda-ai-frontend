import { describe, expect, it } from "vitest";
import {
  campaignExperiences,
  resolveKnownProspect,
  sanitizeAcquisitionContext,
} from "../campaigns";
import {
  buildServiceGuidance,
  detectPreviousBuyerIntent,
} from "../customer-journey";
import {
  acceptProspectConsent,
  answerProspectMessage,
  buildPublicScenario,
  createProspectSession,
} from "../engine";

function createKnownSession(leadId: string, id = leadId) {
  return createProspectSession({
    id,
    acquisition: sanitizeAcquisitionContext({
      utm_campaign: "general",
      leadId,
    }),
    campaign: campaignExperiences.general,
    timestamp: "2026-07-23T12:00:00.000Z",
  });
}

describe("known customer journeys", () => {
  it("recognizes affiliate, non-affiliate and previous-buyer relationships", () => {
    expect(createKnownSession("vm_Jonathan30X1").customerRelationship).toBe(
      "AFFILIATE",
    );
    expect(createKnownSession("vm_Laura30X2026").customerRelationship).toBe(
      "NON_AFFILIATE",
    );

    const previousBuyer = createKnownSession("vm_AndresBuyer2026");
    expect(previousBuyer.customerRelationship).toBe("PREVIOUS_BUYER");
    expect(previousBuyer.knownHousing).toEqual({
      projectName: "Ciudadela Maiporé",
      city: "Soacha",
      purchaseYear: 2021,
    });
    expect(previousBuyer.nextAction).toBe(
      "DISCOVER_PREVIOUS_BUYER_INTENT",
    );
    expect(resolveKnownProspect("vm_AndresBuyer2026")?.profile.incomeRange).toBe(
      "MID",
    );
  });

  it.each([
    ["Quiero comprar otra vivienda para invertir", "BUY_AGAIN"],
    ["Quiero remodelar y mejorar los acabados", "HOME_IMPROVEMENT"],
    ["Necesito conocer los beneficios disponibles", "BENEFITS"],
    ["Tengo una humedad y necesito solicitar garantía", "AFTER_SALES"],
  ] as const)("detects %s as %s", (message, expected) => {
    expect(detectPreviousBuyerIntent(message)).toBe(expected);
  });

  it("continues normal commercial profiling when a previous buyer wants another home", () => {
    let session = acceptProspectConsent(
      createKnownSession("vm_AndresBuyer2026", "buyer-new-home"),
      "2026-07-23T12:00:01.000Z",
    );
    session = answerProspectMessage(
      session,
      "Quiero comprar otra vivienda.",
      "2026-07-23T12:01:00.000Z",
    );

    expect(session.status).toBe("ACTIVE");
    expect(session.previousBuyerIntent).toBe("BUY_AGAIN");
    expect(session.nextAction).toBe("DISCOVER_MOTIVATION");
    expect(session.evaluation).toBeUndefined();

    session = answerProspectMessage(
      session,
      "Busco una vivienda en Soacha para mi familia porque quiero invertir. Me preocupa que la cuota sea manejable, ya tengo una base de ahorro y necesito saber si puedo avanzar.",
      "2026-07-23T12:02:00.000Z",
    );
    session = answerProspectMessage(
      session,
      "No tengo deudas y quiero comprar entre 3 y 6 meses.",
      "2026-07-23T12:03:00.000Z",
    );

    expect(session.status).toBe("COMPLETED");
    expect(session.serviceGuidance).toBeUndefined();
    expect(session.evaluation?.route).toBe("ADVISOR_NOW");
    expect(session.evaluation?.projectMatches.length).toBeGreaterThan(0);

    const advisorScenario = buildPublicScenario(session);
    expect(advisorScenario.engagementSignals).toEqual(
      expect.arrayContaining([
        "Comprador anterior reconocido con datos locales simulados",
        "Compra anterior: Ciudadela Maiporé, 2021",
      ]),
    );
  });

  it("keeps commercial signals included in the buyer's intention message", () => {
    let session = acceptProspectConsent(
      createKnownSession("vm_AndresBuyer2026", "buyer-detailed-intent"),
      "2026-07-23T12:00:01.000Z",
    );
    session = answerProspectMessage(
      session,
      "Quiero comprar otra vivienda en Soacha para mi familia y me preocupa que la cuota sea manejable.",
      "2026-07-23T12:01:00.000Z",
    );

    expect(session.previousBuyerIntent).toBe("BUY_AGAIN");
    expect(session.answers).toMatchObject({
      location: "SOACHA",
      mainConcern: "PAYMENT",
      householdSize: "3",
    });
    expect(session.discovery.housingVision).toContain("otra vivienda");
    expect(session.turns.at(-1)?.extractedFields).toEqual(
      expect.arrayContaining(["location", "mainConcern", "householdSize"]),
    );
  });

  it.each([
    ["Quiero mejorar los acabados de mi vivienda", "HOME_IMPROVEMENT"],
    ["Quiero conocer beneficios para mi vivienda", "BENEFITS_GUIDANCE"],
    ["Necesito ayuda de postventa por una humedad", "AFTER_SALES"],
  ] as const)(
    "completes %s as a service route without creating a commercial evaluation",
    (message, route) => {
      let session = acceptProspectConsent(
        createKnownSession(
          "vm_AndresBuyer2026",
          `buyer-${route.toLowerCase()}`,
        ),
        "2026-07-23T12:00:01.000Z",
      );
      session = answerProspectMessage(
        session,
        message,
        "2026-07-23T12:01:00.000Z",
      );

      expect(session.status).toBe("COMPLETED");
      expect(session.serviceGuidance?.route).toBe(route);
      expect(session.serviceGuidance?.knownContext).toContain(
        "Vivienda adquirida: Ciudadela Maiporé",
      );
      expect(session.evaluation).toBeUndefined();
    },
  );

  it("keeps asking naturally when the previous buyer intention is ambiguous", () => {
    let session = acceptProspectConsent(
      createKnownSession("vm_AndresBuyer2026", "buyer-ambiguous"),
      "2026-07-23T12:00:01.000Z",
    );
    session = answerProspectMessage(
      session,
      "Quiero revisar una cosa de vivienda.",
      "2026-07-23T12:01:00.000Z",
    );

    expect(session.status).toBe("ACTIVE");
    expect(session.nextAction).toBe(
      "DISCOVER_PREVIOUS_BUYER_INTENT",
    );
    expect(session.turns.at(-1)?.assistantText).toContain(
      "comprar otra vivienda",
    );
  });

  it("uses only evidence-backed language in service guidance", () => {
    const guidance = buildServiceGuidance({
      intent: "HOME_IMPROVEMENT",
      knownHousing: {
        projectName: "Ciudadela Maiporé",
        city: "Soacha",
        purchaseYear: 2021,
      },
      knownBenefits: [],
    });

    expect(guidance.projectSummary).toContain("No mostramos proyectos nuevos");
    expect(guidance.benefitSummary.join(" ")).toContain("por validar");
  });
});
