import { listProjects, type ProjectDto } from "@/lib/api/projects";
import { housingProjects } from "./catalog";
import type { HousingProject } from "./types";

// In-memory cache so the back is hit at most once per session.
let cache: HousingProject[] | null = null;

// Back returns metadata only (no gallery/evidence/typologies). We enrich each
// project with the local catalog entry when its id matches, so the UI keeps
// its rich content even if the back has not been extended yet.
function toHousingProject(dto: ProjectDto, local?: HousingProject): HousingProject {
  const tours = (dto.tour_urls ?? []).map((url, i) => ({
    id: `${dto.id}-tour-${i}`,
    label: local?.tours?.[i]?.label ?? "Recorrido virtual",
    url,
    availability: "AVAILABLE" as const,
    sourceId: local?.tours?.[i]?.sourceId ?? `${dto.id}-brochure`,
    verifiedAt: local?.tours?.[i]?.verifiedAt ?? dto.updated_at,
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
    image: local?.image ?? dto.brochure_url ?? "",
    gallery: local?.gallery ?? [],
    brochureUrl: dto.brochure_url,
    summary: dto.summary,
    totalUnits: local?.totalUnits ?? { value: null, sourceIds: [], verifiedAt: dto.updated_at, validity: "REQUIRES_CONFIRMATION" },
    towers: local?.towers ?? { value: null, sourceIds: [], verifiedAt: dto.updated_at, validity: "REQUIRES_CONFIRMATION" },
    floorsPerTower: local?.floorsPerTower ?? { value: null, sourceIds: [], verifiedAt: dto.updated_at, validity: "REQUIRES_CONFIRMATION" },
    hasElevator: local?.hasElevator ?? { value: null, sourceIds: [], verifiedAt: dto.updated_at, validity: "REQUIRES_CONFIRMATION" },
    typologies: local?.typologies ?? [],
    bedrooms: local?.bedrooms ?? { value: null, sourceIds: [], verifiedAt: dto.updated_at, validity: "REQUIRES_CONFIRMATION" },
    finish: local?.finish ?? { value: null, sourceIds: [], verifiedAt: dto.updated_at, validity: "REQUIRES_CONFIRMATION" },
    certification: local?.certification ?? { value: null, sourceIds: [], verifiedAt: dto.updated_at, validity: "REQUIRES_CONFIRMATION" },
    priceFromCop: local?.priceFromCop ?? { value: null, sourceIds: [], verifiedAt: dto.updated_at, validity: "REQUIRES_CONFIRMATION" },
    inventory: local?.inventory ?? { value: null, sourceIds: [], verifiedAt: dto.updated_at, validity: "REQUIRES_CONFIRMATION" },
    deliveryDate: local?.deliveryDate ?? { value: null, sourceIds: [], verifiedAt: dto.updated_at, validity: "REQUIRES_CONFIRMATION" },
    features: local?.features ?? [],
    tours,
    evidence: local?.evidence ?? [],
  };
}

/**
 * Loads the project catalog from the backend, with the local mock as fallback
 * if the request fails (CORS, network down, back not running). Results are
 * cached for the lifetime of the JS context.
 */
export async function getHousingProjectsFromBackend(): Promise<HousingProject[]> {
  if (cache) return cache;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "(not set)";
  console.log(`[A1] getHousingProjectsFromBackend() → fetching from ${apiUrl}/projects`);
  cache = await listProjects()
    .then((dtos: ProjectDto[]) => {
      console.log(`[A1] ✓ back returned ${dtos.length} projects`);
      return dtos.map((dto) => toHousingProject(dto, findLocal(dto.id)));
    })
    .catch((err) => {
      console.warn(`[A1] ✗ back unreachable (${(err as Error).message ?? err}); using local mock fallback`);
      return housingProjects;
    });
  return cache;
}

function findLocal(id: string): HousingProject | undefined {
  return housingProjects.find((p) => p.id === id);
}
