export type EvidenceKind =
  | "OFFICIAL_PROJECT_PAGE"
  | "APPROVED_BROCHURE"
  | "VIRTUAL_TOUR";

export type EvidenceSource = {
  id: string;
  kind: EvidenceKind;
  title: string;
  url?: string;
  verifiedAt: string;
  materialStatus: "APPROVED" | "LIVE";
};

export type FactValidity =
  | "CURRENT"
  | "COMMERCIAL_REFERENCE"
  | "REQUIRES_CONFIRMATION";

export type EvidenceBackedFact<T> = {
  value: T;
  sourceIds: readonly string[];
  verifiedAt: string;
  validity: FactValidity;
};

export type HousingTypology = {
  id: string;
  label: string;
  builtAreaM2: number;
  sourceIds: readonly string[];
};

export type VirtualTour = {
  id: string;
  label: string;
  url: string;
  availability: "AVAILABLE" | "UNAVAILABLE";
  sourceId: string;
  verifiedAt: string;
};

export type ProjectGalleryMedia = {
  id: string;
  kind: "PROJECT_VIEW" | "BROCHURE_PLAN";
  label: string;
  description: string;
  image: string;
  sourceId: string;
  sourcePage: number | null;
};

export type HousingProject = {
  id: string;
  name: string;
  location: {
    city: string;
    department: string;
    development: string;
  };
  catalogStatus: "COMMERCIAL_MATERIAL_APPROVED";
  housingType: "VIS" | "NO_VIS" | null;
  image: string;
  gallery: readonly ProjectGalleryMedia[];
  brochureUrl: string | null;
  summary: string;
  totalUnits: EvidenceBackedFact<number | null>;
  towers: EvidenceBackedFact<number | null>;
  floorsPerTower: EvidenceBackedFact<string | null>;
  hasElevator: EvidenceBackedFact<boolean | null>;
  typologies: readonly HousingTypology[];
  bedrooms: EvidenceBackedFact<string | null>;
  finish: EvidenceBackedFact<string | null>;
  certification: EvidenceBackedFact<string | null>;
  priceFromCop: EvidenceBackedFact<number | null>;
  inventory: EvidenceBackedFact<null>;
  deliveryDate: EvidenceBackedFact<string | null>;
  features: readonly string[];
  tours: readonly VirtualTour[];
  evidence: readonly EvidenceSource[];
};
