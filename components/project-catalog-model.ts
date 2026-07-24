import {
  formatProjectAreaRange,
  formatProjectPrice,
  getHousingTypeLabel,
  type HousingProject,
} from "../lib/housing-catalog";

export type ProjectCatalogItem = {
  id: string;
  name: string;
  image: string;
  city: string;
  department: string;
  development: string;
  summary: string;
  housingTypeLabel: string;
  hasTour: boolean;
  mediaCount: number;
  priceLabel: string;
  areaLabel: string;
  bedroomsLabel: string;
  totalUnitsLabel: string;
};

export function createProjectCatalogItem(
  project: HousingProject,
): ProjectCatalogItem {
  const availableTours = project.tours.filter(
    ({ availability }) => availability === "AVAILABLE",
  );

  return {
    id: project.id,
    name: project.name,
    image: project.image,
    city: project.location.city,
    department: project.location.department,
    development: project.location.development,
    summary: project.summary,
    housingTypeLabel: getHousingTypeLabel(project.housingType),
    hasTour: availableTours.length > 0,
    mediaCount:
      project.gallery.length +
      availableTours.length +
      (project.brochureUrl ? 1 : 0),
    priceLabel: formatProjectPrice(project),
    areaLabel: formatProjectAreaRange(project),
    bedroomsLabel: project.bedrooms.value ?? "Por confirmar",
    totalUnitsLabel:
      project.totalUnits.value?.toLocaleString("es-CO") ?? "Por confirmar",
  };
}

export function createProjectCatalogItems(
  projects: readonly HousingProject[],
): ProjectCatalogItem[] {
  return projects.map(createProjectCatalogItem);
}
