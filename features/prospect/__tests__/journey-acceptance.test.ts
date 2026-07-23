import { describe, expect, it } from "vitest";
import { getReadinessPresentation } from "../../conversation/readiness-presentation";
import { campaignExperiences, sanitizeAcquisitionContext } from "../campaigns";
import {
  acceptProspectConsent,
  answerProspectMessage,
  createProspectSession,
} from "../engine";
import {
  PROJECT_REFERENCE_NOTICE,
  PROJECT_VALIDITY_NOTICE,
} from "../result-copy";

const timestamp = "2026-07-23T12:00:00.000Z";

function startJourney(id: string) {
  return acceptProspectConsent(
    createProspectSession({
      id,
      acquisition: sanitizeAcquisitionContext({ utm_campaign: "general" }),
      campaign: campaignExperiences.general,
      timestamp,
    }),
    "2026-07-23T12:00:01.000Z",
  );
}

describe("critical prospect journey acceptance", () => {
  it("routes a highly prepared prospect to explained recommendations and an advisor", () => {
    const session = answerProspectMessage(
      startJourney("acceptance-high"),
      "Busco en Soacha para vivir con mi familia porque quiero dejar de pagar arriendo. Quiero comprar cuanto antes, estoy afiliado, recibimos más de 4 salarios, no tengo deudas y ya tengo la cuota inicial. Me preocupa que la cuota sea manejable y necesito entender qué proyecto me conviene para avanzar.",
      "2026-07-23T12:01:00.000Z",
    );

    expect(session.status).toBe("COMPLETED");
    expect(session.evaluation?.route).toBe("ADVISOR_NOW");
    expect(
      getReadinessPresentation(session.evaluation!.readinessScore).label,
    ).toBe("Alta");
    expect(session.evaluation?.factors.length).toBeGreaterThan(0);
    expect(session.evaluation?.projectMatches.length).toBeGreaterThan(0);
    expect(session.evaluation?.projectMatches.length).toBeLessThanOrEqual(3);
    expect(
      session.evaluation?.projectMatches.every(({ reasons }) => reasons.length),
    ).toBe(true);
  });

  it("gives a prospect in development a concrete financial preparation plan", () => {
    const session = answerProspectMessage(
      startJourney("acceptance-development"),
      "Busco en Soacha para mi familia porque quiero dejar de pagar arriendo. Estoy afiliado y quiero comprar este año. Recibimos entre 2 y 4 salarios, tengo algunas deudas y no tengo ahorro. Me preocupa la cuota inicial y necesito entender cómo prepararme para avanzar.",
      "2026-07-23T12:01:00.000Z",
    );

    expect(session.status).toBe("COMPLETED");
    expect(session.evaluation?.route).toBe("NURTURE_FINANCIAL");
    expect(
      getReadinessPresentation(session.evaluation!.readinessScore).label,
    ).toBe("En desarrollo");
    expect(session.evaluation?.blockers).toContain(
      "Ahorro inicial insuficiente",
    );
    expect(session.evaluation?.nextAction).toContain("meta de ahorro");
    expect(session.evaluation?.advanceCondition).toContain("evidenciar avance");
    expect(session.evaluation?.followUpAt).toBeTruthy();
  });

  it("keeps an initially prepared prospect in a realistic gradual route", () => {
    let session = answerProspectMessage(
      startJourney("acceptance-initial"),
      "Quiero prepararme a largo plazo para comprar una vivienda para mi familia. No sé en qué zona, estoy afiliado y estoy ahorrando poco. Me preocupa la cuota y necesito entender qué debo ordenar para avanzar.",
      "2026-07-23T12:01:00.000Z",
    );
    session = answerProspectMessage(
      session,
      "No sé todavía cuáles son los ingresos y no tengo claro qué parte se va en deudas.",
      "2026-07-23T12:02:00.000Z",
    );

    expect(session.status).toBe("COMPLETED");
    expect(session.evaluation?.route).toBe("NURTURE_LONG_TERM");
    expect(
      getReadinessPresentation(session.evaluation!.readinessScore).label,
    ).toBe("Inicial");
    expect(session.evaluation?.nextAction).toContain("seguimiento");
    expect(session.evaluation?.advanceCondition).toContain(
      "horizonte de compra menor a doce meses",
    );
    expect(session.evaluation?.followUpAt).toBeTruthy();
  });

  it("keeps an incomplete journey active and asks for the next necessary condition", () => {
    const session = answerProspectMessage(
      startJourney("acceptance-incomplete"),
      "Quiero entender mejor mis opciones de vivienda.",
      "2026-07-23T12:01:00.000Z",
    );

    expect(session.status).toBe("ACTIVE");
    expect(session.evaluation).toBeUndefined();
    expect(session.nextAction).toBe("DISCOVER_MOTIVATION");
    expect(session.turns.at(-1)?.assistantText).toContain(
      "¿Qué te motivó a buscar vivienda justo ahora?",
    );
  });

  it("states that preparation projects are references rather than promises", () => {
    expect(PROJECT_REFERENCE_NOTICE).toContain("definir una meta");
    expect(PROJECT_REFERENCE_NOTICE).toContain("no representan reserva");
    expect(PROJECT_REFERENCE_NOTICE).toContain(
      "disponibilidad confirmada",
    );
    expect(PROJECT_VALIDITY_NOTICE).toContain("por confirmar");
  });
});
