import { describe, expect, it } from "vitest";
import {
  findHousingProjectsByCity,
  formatProjectAreaRange,
  formatProjectPrice,
  getHousingProject,
  getRecommendedProjectTours,
} from "..";

describe("evidence-backed housing catalog", () => {
  it("normalizes every approved project from the brochure inventory", () => {
    expect([
      ...findHousingProjectsByCity("Bogotá"),
      ...findHousingProjectsByCity("Soacha"),
      ...findHousingProjectsByCity("Tocancipá"),
      ...findHousingProjectsByCity("Chía"),
      ...findHousingProjectsByCity("Girardot"),
      ...findHousingProjectsByCity("Ricaurte"),
      ...findHousingProjectsByCity("Ubaté"),
    ]).toHaveLength(18);

    expect(findHousingProjectsByCity("Bogotá").map(({ id }) => id)).toEqual([
      "abeto",
      "araucaria",
      "los-nogales",
      "vibo-once",
      "karakali",
      "la-arboleda",
    ]);
    expect(findHousingProjectsByCity("Soacha").map(({ id }) => id)).toEqual([
      "pamplona",
      "la-macarena",
      "mongui",
      "versalles",
      "zarzal",
    ]);
  });

  it("uses the verified Versalles facts instead of the obsolete fixture", () => {
    const project = getHousingProject("versalles");

    expect(project).toBeDefined();
    expect(project?.priceFromCop.value).toBe(214_300_000);
    expect(formatProjectPrice(project!)).toContain("214.300.000");
    expect(project?.totalUnits.value).toBe(560);
    expect(project?.towers.value).toBe(4);
    expect(project?.floorsPerTower.value).toBe("10");
    expect(project?.hasElevator.value).toBe(true);
    expect(project?.finish.value).toBe("Obra gris");
    expect(project?.certification.value).toBe("EDGE");
    expect(project?.typologies.map(({ builtAreaM2 }) => builtAreaM2)).toEqual([
      45.05,
      51.41,
      56.29,
    ]);
    expect(formatProjectAreaRange(project!)).toBe("45,05–56,29 m²");
  });

  it("never turns approved material into an inventory claim", () => {
    const project = getHousingProject("versalles")!;

    expect(project.catalogStatus).toBe("COMMERCIAL_MATERIAL_APPROVED");
    expect(project.inventory).toMatchObject({
      value: null,
      validity: "REQUIRES_CONFIRMATION",
    });
    expect(project.deliveryDate).toMatchObject({
      value: null,
      validity: "REQUIRES_CONFIRMATION",
    });
    expect(project.inventory.sourceIds.length).toBeGreaterThan(0);
    expect(project.inventory.verifiedAt).toBe("2026-07-23");
  });

  it("exposes all four tours only through recommended project ids", () => {
    expect(getRecommendedProjectTours([])).toEqual([]);
    expect(getRecommendedProjectTours(["versalles"])).toHaveLength(4);
    expect(getRecommendedProjectTours(["versalles"]).every(({ availability }) =>
      availability === "AVAILABLE")).toBe(true);
    expect(getRecommendedProjectTours(["payande"])).toEqual([]);
  });

  it("keeps brochure approval separate from price, inventory and delivery validity", () => {
    const project = getHousingProject("pamplona")!;

    expect(project.brochureUrl).toContain("heyzine.com");
    expect(project.priceFromCop).toMatchObject({
      value: null,
      validity: "REQUIRES_CONFIRMATION",
    });
    expect(project.inventory.validity).toBe("REQUIRES_CONFIRMATION");
    expect(project.deliveryDate.validity).toBe("REQUIRES_CONFIRMATION");
    expect(project.evidence.some(({ kind }) => kind === "APPROVED_BROCHURE")).toBe(true);
  });
});
