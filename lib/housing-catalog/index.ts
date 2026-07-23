import { housingProjects } from "./catalog";
import type {
  EvidenceBackedFact,
  EvidenceSource,
  HousingProject,
  VirtualTour,
} from "./types";

export { housingProjects };
export type {
  EvidenceBackedFact,
  EvidenceSource,
  HousingProject,
  VirtualTour,
} from "./types";

export function getHousingProject(projectId: string): HousingProject | undefined {
  return housingProjects.find((project) => project.id === projectId);
}

export function getHousingProjects(projectIds?: readonly string[]): HousingProject[] {
  if (!projectIds) return [...housingProjects];
  const selected = new Set(projectIds);
  return housingProjects.filter((project) => selected.has(project.id));
}

export function findHousingProjectsByCity(city: string): HousingProject[] {
  const normalizedCity = city.trim().toLocaleLowerCase("es-CO");
  return housingProjects.filter((project) =>
    project.location.city.toLocaleLowerCase("es-CO") === normalizedCity);
}

export function getRecommendedProjectTours(projectIds: readonly string[]): VirtualTour[] {
  return getHousingProjects(projectIds).flatMap((project) =>
    project.tours.filter((tour) => tour.availability === "AVAILABLE"),
  );
}

export function getProjectEvidence(
  project: HousingProject,
  fact: EvidenceBackedFact<unknown>,
): EvidenceSource[] {
  const sourceIds = new Set(fact.sourceIds);
  return project.evidence.filter((source) => sourceIds.has(source.id));
}

export function formatProjectPrice(project: HousingProject): string {
  if (project.priceFromCop.value === null) return "Por confirmar";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(project.priceFromCop.value);
}

export function getHousingTypeLabel(
  housingType: HousingProject["housingType"],
): string {
  if (housingType === "VIS") return "Vivienda de interés social";
  if (housingType === "NO_VIS") return "Proyecto residencial";
  return "Proyecto de vivienda";
}

export function formatProjectAreaRange(project: HousingProject): string {
  const areas = project.typologies.map((typology) => typology.builtAreaM2);
  const minimum = Math.min(...areas);
  const maximum = Math.max(...areas);
  return `${formatDecimal(minimum)}–${formatDecimal(maximum)} m²`;
}

export function formatTypologyArea(area: number): string {
  return `${formatDecimal(area)} m²`;
}

export function formatVerificationDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Bogota",
  }).format(new Date(`${value}T12:00:00-05:00`));
}

export function getValidityLabel(validity: EvidenceBackedFact<unknown>["validity"]): string {
  if (validity === "CURRENT") return "Vigente al verificar";
  if (validity === "COMMERCIAL_REFERENCE") return "Referencia comercial aprobada";
  return "Requiere confirmación";
}

function formatDecimal(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
