import { describe, expect, it } from "vitest";
import { createProjectCatalogItem } from "../project-catalog-model";
import { housingProjects } from "../../lib/housing-catalog";

describe("project catalog view model", () => {
  it("sends only card and search data to the client catalog", () => {
    const item = createProjectCatalogItem(housingProjects[0]);

    expect(Object.keys(item).sort()).toEqual(
      [
        "areaLabel",
        "bedroomsLabel",
        "city",
        "department",
        "development",
        "hasTour",
        "housingTypeLabel",
        "id",
        "image",
        "mediaCount",
        "name",
        "priceLabel",
        "summary",
        "totalUnitsLabel",
      ].sort(),
    );
    expect(item).not.toHaveProperty("gallery");
    expect(item).not.toHaveProperty("evidence");
    expect(item).not.toHaveProperty("tours");
    expect(item).not.toHaveProperty("typologies");
  });
});
