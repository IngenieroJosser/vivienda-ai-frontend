import "server-only";
import { listProjects, type ProjectDto } from "@/lib/api/projects";
import { CATALOG_VERIFIED_AT, housingProjects } from "./catalog";
import type { HousingProject } from "./types";

// Back returns metadata only (no gallery/evidence/typologies). We enrich each
// project with the local catalog entry when its id matches, so the UI keeps
// its rich content even if the back has not been extended yet.
function toHousingProject(
  dto: ProjectDto,
  local: HousingProject,
): HousingProject {
  const tours = (dto.tour_urls ?? []).map((url, i) => ({
    id: `${dto.id}-tour-${i}`,
    label: local?.tours?.[i]?.label ?? "Recorrido virtual",
    url,
    availability: "AVAILABLE" as const,
    sourceId: local?.tours?.[i]?.sourceId ?? `${dto.id}-brochure`,
    verifiedAt: local?.tours?.[i]?.verifiedAt ?? CATALOG_VERIFIED_AT,
  }));

  return {
    id: dto.id,
    name: dto.name,
    location: {
      city: dto.city,
      department: local?.location?.department ?? dto.development,
      development: dto.development,
    },
    catalogStatus: "COMMERCIAL_MATERIAL_APPROVED",
    housingType: (dto.housing_type as HousingProject["housingType"]) ?? null,
    image: local.image,
    gallery: local.gallery,
    brochureUrl: dto.brochure_url,
    summary: dto.summary,
    totalUnits: local.totalUnits,
    towers: local.towers,
    floorsPerTower: local.floorsPerTower,
    hasElevator: local.hasElevator,
    typologies: local.typologies,
    bedrooms: local.bedrooms,
    finish: local.finish,
    certification: local.certification,
    priceFromCop: local.priceFromCop,
    inventory: local.inventory,
    deliveryDate: local.deliveryDate,
    features: local.features,
    tours,
    evidence: local.evidence,
  };
}

/**
 * Loads the project catalog from the backend, with the verified local catalog as fallback
 * if the request fails (CORS, network down, back not running). Results are
 * cached for the lifetime of the JS context.
 */
export async function getHousingProjectsFromBackend(): Promise<HousingProject[]> {
  try {
    const projects = (await listProjects()).flatMap((dto) => {
      const local = findLocal(dto.id);
      return local ? [toHousingProject(dto, local)] : [];
    });
    return projects.length ? projects : housingProjects;
  } catch {
    return housingProjects;
  }
}

function findLocal(id: string): HousingProject | undefined {
  return housingProjects.find((p) => p.id === id);
}
