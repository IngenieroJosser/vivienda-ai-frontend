import { describe, expect, it } from "vitest";
import {
  getEvidencePresentation,
  getReadinessPresentation,
} from "../readiness-presentation";

describe("readiness presentation", () => {
  it("turns internal scores into understandable preparation labels", () => {
    expect(getReadinessPresentation(75).label).toBe("Alta");
    expect(getReadinessPresentation(74).label).toBe("En desarrollo");
    expect(getReadinessPresentation(49).label).toBe("Inicial");
  });

  it("describes evidence without presenting a predictive probability", () => {
    expect(getEvidencePresentation(0.8).label).toBe("Sólida");
    expect(getEvidencePresentation(0.79).label).toBe("Parcial");
    expect(getEvidencePresentation(0.64).label).toBe("Por completar");
  });
});
