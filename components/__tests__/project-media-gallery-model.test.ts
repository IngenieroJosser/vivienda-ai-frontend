import { describe, expect, it } from "vitest";
import { getHousingProject } from "../../lib/housing-catalog";
import {
  createProjectGalleryImages,
  createProjectResources,
} from "../project-media-gallery-model";

describe("project media gallery model", () => {
  it("keeps only verified project photographs inside the image gallery", () => {
    const project = getHousingProject("versalles")!;
    const images = createProjectGalleryImages(project);

    expect(images).toEqual([
      expect.objectContaining({
        id: "versalles-main-photo",
        image: project.image,
        label: "Vista principal",
      }),
    ]);
    expect(images).toHaveLength(1);
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
