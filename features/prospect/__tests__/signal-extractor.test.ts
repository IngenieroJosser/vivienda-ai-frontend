import { describe, expect, it } from "vitest";
import { extractProspectSignals } from "../signal-extractor";

describe("prospect signal extractor", () => {
  it("captures income range quick replies without requiring extra wording", () => {
    expect(
      extractProspectSignals("Hasta 3 millones", "incomeRange").profile.incomeRange,
    ).toBe("LOW");
    expect(
      extractProspectSignals("Entre 3 y 7 millones", "incomeRange").profile.incomeRange,
    ).toBe("MID");
    expect(
      extractProspectSignals("Más de 7 millones", "incomeRange").profile.incomeRange,
    ).toBe("HIGH");
  });

  it("uses the expected conversation action to understand short replies", () => {
    expect(
      extractProspectSignals("Intermedias", "obligations").profile.obligations,
    ).toBe("MEDIUM");
    expect(
      extractProspectSignals("Ya tengo una base", "savings").profile.savings,
    ).toBe("READY");
    expect(
      extractProspectSignals("Necesito revisarlo", "creditStatus").profile
        .creditStatus,
    ).toBe("REQUIRES_REVIEW");
  });

  it("extracts several financial signals from one natural answer", () => {
    const result = extractProspectSignals(
      "En casa recibimos cerca de 4 millones, pagamos 500 mil en cuotas " +
        "y tenemos 25 millones ahorrados.",
      "FINANCIAL_CONTEXT",
    );

    expect(result.profile.incomeRange).toBe("MID");
    expect(result.profile.obligations).toBe("LOW");
    expect(result.profile.savings).toBe("READY");
  });

  it("captures the contact details used by the advisor handoff", () => {
    expect(
      extractProspectSignals("Me llamo Laura Gómez", "fullName").profile
        .fullName,
    ).toBe("Laura Gómez");
    expect(
      extractProspectSignals("Mi número es 300 123 4567", "phone").profile
        .phone,
    ).toBe("3001234567");
    expect(
      extractProspectSignals("Entre semana en la mañana", "contactTimePreference")
        .profile.contactTimePreference,
    ).toBe("WEEKDAY_MORNING");
  });
});
