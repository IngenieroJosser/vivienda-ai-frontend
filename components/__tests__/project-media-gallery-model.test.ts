import { describe, expect, it } from "vitest";
import { getHousingProject } from "../../lib/housing-catalog";
import { isAllowedProjectEmbed } from "../../lib/housing-catalog/embed";
import {
  createProjectGalleryImages,
  createProjectResources,
  getCenteredSlideOffset,
  getClosestSlideIndex,
  getHorizontalSwipeDirection,
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
          id: "versalles-brochure-page-10",
          kind: "BROCHURE_PLAN",
          label: "Apartamento tipo A",
          sourcePage: 10,
        }),
        expect.objectContaining({
          id: "versalles-brochure-page-11",
          kind: "BROCHURE_PLAN",
          label: "Apartamento tipo B",
          sourcePage: 11,
        }),
      ]),
    );
    expect(images).toHaveLength(3);
  });

  it("uses only verified apartment plans as brochure-backed gallery material", () => {
    const verifiedPlanCountByProject = {
      abeto: 0,
      araucaria: 2,
      "los-nogales": 2,
      pamplona: 2,
      "la-macarena": 2,
      mongui: 2,
      versalles: 2,
      zarzal: 2,
      "bosque-de-arrayan": 2,
      "bosque-de-turpial": 2,
      inari: 2,
      "reserva-de-guayacan": 2,
      saman: 2,
      payande: 2,
      "vibo-once": 2,
      karakali: 2,
      "la-arboleda": 0,
      "verde-esperanza": 1,
    } as const;

    for (const [projectId, verifiedPlanCount] of Object.entries(
      verifiedPlanCountByProject,
    )) {
      const images = createProjectGalleryImages(getHousingProject(projectId)!);
      expect(images).toHaveLength(verifiedPlanCount + 1);
      expect(images.slice(1).every(({ sourcePage }) => sourcePage !== null)).toBe(
        true,
      );
      expect(images.slice(1).every(({ kind }) => kind === "BROCHURE_PLAN")).toBe(
        true,
      );
      expect(images.every(({ image }) => image.startsWith("/images/projects/"))).toBe(
        true,
      );
    }
  });

  it("exposes the two verified Los Nogales apartment types", () => {
    const images = createProjectGalleryImages(getHousingProject("los-nogales")!);

    expect(images.slice(1).map(({ label }) => label)).toEqual([
      "Apartamento tipo A",
      "Apartamento tipo B",
    ]);
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

  it("allows every exposed project resource inside the protected viewer", () => {
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
      const resources = createProjectResources(getHousingProject(projectId)!);
      expect(resources.every(({ url }) => isAllowedProjectEmbed(url))).toBe(true);
    }
  });

  it("centers a requested slide without coupling it to the observed index", () => {
    expect(
      getCenteredSlideOffset({
        trackWidth: 360,
        slideOffset: 340,
        slideWidth: 316,
      }),
    ).toBe(318);
  });

  it("resolves the closest slide while the user scrolls", () => {
    expect(
      getClosestSlideIndex({
        scrollLeft: 300,
        trackWidth: 360,
        slides: [
          { offset: 40, width: 316 },
          { offset: 366, width: 316 },
          { offset: 692, width: 316 },
        ],
      }),
    ).toBe(1);
  });

  it("accepts intentional horizontal swipes and ignores vertical movement", () => {
    expect(
      getHorizontalSwipeDirection({
        startX: 280,
        startY: 240,
        endX: 190,
        endY: 247,
      }),
    ).toBe("NEXT");
    expect(
      getHorizontalSwipeDirection({
        startX: 120,
        startY: 240,
        endX: 205,
        endY: 235,
      }),
    ).toBe("PREVIOUS");
    expect(
      getHorizontalSwipeDirection({
        startX: 200,
        startY: 180,
        endX: 170,
        endY: 80,
      }),
    ).toBeNull();
    expect(
      getHorizontalSwipeDirection({
        startX: 200,
        startY: 180,
        endX: 170,
        endY: 185,
      }),
    ).toBeNull();
  });
});
