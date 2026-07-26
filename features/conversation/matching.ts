import { getHousingProject, housingProjects } from "../../lib/housing-catalog";
import type { HousingProject } from "../../lib/housing-catalog";
import type {
  EvaluationResult,
  ProfileAnswers,
  ProjectMatch,
  ProjectMatchSignal,
} from "./domain";

const MAX_RECOMMENDATIONS = 3;

const cityByProfileLocation: Record<string, string> = {
  BOGOTA: "Bogotá",
  SOACHA: "Soacha",
};

type MatchInput = {
  profile: ProfileAnswers;
  capacity: EvaluationResult["capacity"];
  campaignProjectId?: string;
};

type RankedProject = {
  project: HousingProject;
  score: number;
  signals: ProjectMatchSignal[];
  reasons: string[];
};

export type ResolvedProjectMatch = {
  match: ProjectMatch;
  project: HousingProject;
};

export function matchHousingProjects({
  profile,
  capacity,
  campaignProjectId,
}: MatchInput): ProjectMatch[] {
  const preferredCity = cityByProfileLocation[profile.location ?? ""];
  const campaignProject = campaignProjectId
    ? getHousingProject(campaignProjectId)
    : undefined;
  const candidateCity = preferredCity ?? campaignProject?.location.city;

  if (!candidateCity) return [];

  return housingProjects
    .filter((project) => project.location.city === candidateCity)
    .map((project) =>
      rankProject({
        project,
        profile,
        capacity,
        campaignProjectId,
        preferredCity,
      }),
    )
    .sort((left, right) => right.score - left.score)
    .slice(0, MAX_RECOMMENDATIONS)
    .map(({ project, score, signals, reasons }) => ({
      projectId: project.id,
      score,
      signals,
      reasons,
      evidenceSourceIds: collectEvidenceSourceIds(project),
    }));
}

export function resolveProjectMatches(
  matches: readonly ProjectMatch[],
): ResolvedProjectMatch[] {
  return matches.flatMap((match) => {
    const project = getHousingProject(match.projectId);
    return project ? [{ match, project }] : [];
  });
}

function rankProject(input: {
  project: HousingProject;
  profile: ProfileAnswers;
  capacity: EvaluationResult["capacity"];
  campaignProjectId?: string;
  preferredCity?: string;
}): RankedProject {
  const { project, profile, capacity, campaignProjectId, preferredCity } = input;
  const signals: ProjectMatchSignal[] = [];
  const reasons: string[] = [];
  let score = 0;

  if (preferredCity && project.location.city === preferredCity) {
    score += 40;
    signals.push("LOCATION");
    reasons.push(`Está ubicado en ${project.location.city}, la zona que indicaste.`);
  }

  if (campaignProjectId === project.id) {
    score += 100;
    signals.push("CAMPAIGN");
    reasons.push("Es el proyecto que despertó tu interés en la campaña de Meta.");
  }

  const capacityScore = scoreCapacity(project, capacity);
  if (capacityScore > 0) {
    score += capacityScore;
    signals.push("CAPACITY");
    reasons.push(
      project.housingType === "VIS"
        ? "Su tipología VIS es coherente con el margen financiero preliminar; precio y financiación deben validarse."
        : "Tu capacidad preliminar permite explorar esta tipología; precio y financiación deben validarse.",
    );
  }

  if (fitsHousehold(project, profile.householdSize)) {
    score += 16;
    signals.push("HOUSEHOLD");
    reasons.push(`Sus espacios pueden responder al tamaño de hogar que compartiste (${project.bedrooms.value ?? "distribución por validar"}).`);
  }

  const preferenceReason = matchPreference(project, profile.mainConcern);
  if (preferenceReason) {
    score += 12;
    signals.push("PREFERENCE");
    reasons.push(preferenceReason);
  }

  if (
    ["0_3", "3_6"].includes(profile.horizon ?? "")
    && project.priceFromCop.validity === "CURRENT"
  ) {
    score += 8;
    signals.push("HORIZON");
    reasons.push("Cuenta con un precio publicado vigente al verificar; inventario y entrega siguen por confirmar.");
  }

  return { project, score, signals, reasons };
}

function scoreCapacity(
  project: HousingProject,
  capacity: EvaluationResult["capacity"],
): number {
  if (capacity.status === "UNKNOWN") return 0;
  if (capacity.status === "STRONG") {
    return project.housingType === "NO_VIS" ? 14 : 10;
  }
  return project.housingType === "VIS" ? 14 : 2;
}

function fitsHousehold(
  project: HousingProject,
  householdSize?: string,
): boolean {
  if (!householdSize || !project.bedrooms.value) return false;
  const desiredBedrooms =
    householdSize === "4_PLUS" ? 3
      : householdSize === "3" ? 2
        : 1;
  return getMaximumBedrooms(project.bedrooms.value) >= desiredBedrooms;
}

function getMaximumBedrooms(label: string): number {
  const bedroomCounts = [...label.matchAll(/\d+/g)].map(([value]) => Number(value));
  const maximum = Math.max(0, ...bedroomCounts);
  return /flexible/i.test(label) ? maximum + 1 : maximum;
}

function matchPreference(
  project: HousingProject,
  mainConcern?: string,
): string | undefined {
  if (mainConcern === "PAYMENT" && project.housingType === "VIS") {
    return "Priorizamos vivienda VIS porque señalaste que una cuota manejable es lo más importante.";
  }
  if (mainConcern === "BENEFITS" && project.housingType === "VIS") {
    return "La tipología VIS puede ser relevante al validar beneficios, sin que esto implique aprobación.";
  }
  if (
    mainConcern === "SPACE"
    && Math.max(...project.typologies.map(({ builtAreaM2 }) => builtAreaM2)) >= 50
  ) {
    return "Ofrece tipologías de 50 m² o más, coherentes con tu preferencia por mayor espacio.";
  }
  return undefined;
}

function collectEvidenceSourceIds(project: HousingProject): string[] {
  const availableTourSourceIds = new Set(
    project.tours
      .filter(({ availability }) => availability === "AVAILABLE")
      .map(({ sourceId }) => sourceId),
  );

  return project.evidence
    .filter(
      ({ id, kind, materialStatus }) =>
        kind === "APPROVED_BROCHURE"
        || (kind === "OFFICIAL_PROJECT_PAGE" && materialStatus === "LIVE")
        || (kind === "VIRTUAL_TOUR" && availableTourSourceIds.has(id)),
    )
    .map(({ id }) => id);
}
