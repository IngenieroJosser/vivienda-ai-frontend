import { describe, expect, it } from "vitest";
import { getHousingProject } from "../../lib/housing-catalog";
import {
  createProjectGalleryImages,
  createProjectResources,
} from "../project-media-gallery-model";

describe("project media gallery model", () => {
  it("combines the official project view with selected brochure content", () => {
    const project = getHousingProject("versalles")!;
    const images = createProjectGalleryImages(project);

    expect(images[0]).toEqual(
      expect.objectContaining({
        id: "versalles-main-view",
        image: project.image,
        kind: "PROJECT_VIEW",
        label: "Vista principal",
        sourcePage: null,
      }),
    );
    expect(images.slice(1)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "versalles-brochure-page-9",
          kind: "BROCHURE_PLAN",
          label: "Planta general",
          sourcePage: 9,
        }),
        expect.objectContaining({
          id: "versalles-brochure-page-18",
          kind: "BROCHURE_SPACE",
          label: "Salón comunal",
          sourcePage: 18,
        }),
      ]),
    );
    expect(images).toHaveLength(4);
  });

  it("provides brochure-backed gallery material for every catalog project", () => {
    const projectIds = [
      "abeto",
      "araucaria",
      "los-nogales",
      "pamplona",
      "la-macarena",
      "mongui",
      "versalles",
      "zarzal",
      "bosque-de-arrayan",
      "bosque-de-turpial",
      "inari",
      "reserva-de-guayacan",
      "saman",
      "payande",
      "vibo-once",
      "karakali",
      "la-arboleda",
      "verde-esperanza",
    ];

    for (const projectId of projectIds) {
      const images = createProjectGalleryImages(getHousingProject(projectId)!);
      expect(images.length).toBeGreaterThanOrEqual(3);
      expect(images.slice(1).every(({ sourcePage }) => sourcePage !== null)).toBe(
        true,
      );
      expect(images.every(({ image }) => image.startsWith("/images/projects/"))).toBe(
        true,
      );
    }
  });

  it("keeps tours and brochures separate from project images", () => {
    const project = getHousingProject("versalles")!;
    const resources = createProjectResources(project);

    expect(resources.filter(({ kind }) => kind === "TOUR")).toHaveLength(4);
    expect(resources.filter(({ kind }) => kind === "BROCHURE")).toHaveLength(1);
    expect(resources.every(({ url }) => url.startsWith("https://"))).toBe(true);
  });

  it("never exposes an unavailable tour as a resource", () => {
    const project = getHousingProject("payande")!;
    const resources = createProjectResources(project);

    expect(resources.some(({ id }) => id.includes("unavailable"))).toBe(false);
  });
});
