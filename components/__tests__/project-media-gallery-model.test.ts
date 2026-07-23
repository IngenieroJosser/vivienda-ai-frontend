import { describe, expect, it } from "vitest";
import { getHousingProject } from "../../lib/housing-catalog";
import {
  createProjectMedia,
  moveProjectMediaIndex,
} from "../project-media-gallery-model";

describe("project media gallery model", () => {
  it("builds media only from evidence available for the project", () => {
    const project = getHousingProject("versalles")!;
    const media = createProjectMedia(project);

    expect(media.filter(({ kind }) => kind === "PHOTO")).toHaveLength(1);
    expect(media.filter(({ kind }) => kind === "TYPOLOGY")).toHaveLength(3);
    expect(media.filter(({ kind }) => kind === "TOUR")).toHaveLength(4);
    expect(media.filter(({ kind }) => kind === "BROCHURE")).toHaveLength(1);
    expect(media.every(({ id }) => !id.includes("unavailable"))).toBe(true);
  });

  it("does not invent tours when a project has none available", () => {
    const project = getHousingProject("la-macarena")!;
    const media = createProjectMedia(project);

    expect(media.some(({ kind }) => kind === "TOUR")).toBe(false);
    expect(media.some(({ kind }) => kind === "PHOTO")).toBe(true);
    expect(media.some(({ kind }) => kind === "BROCHURE")).toBe(true);
  });

  it("wraps previous and next navigation without invalid indexes", () => {
    expect(moveProjectMediaIndex(0, 4, -1)).toBe(3);
    expect(moveProjectMediaIndex(3, 4, 1)).toBe(0);
    expect(moveProjectMediaIndex(1, 4, 1)).toBe(2);
    expect(moveProjectMediaIndex(0, 0, 1)).toBe(0);
  });
});
