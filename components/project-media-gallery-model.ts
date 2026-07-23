import {
  formatTypologyArea,
  type HousingProject,
} from "../lib/housing-catalog";

export type ProjectMediaItem =
  | {
      id: string;
      kind: "PHOTO";
      label: string;
      description: string;
      image: string;
      url?: never;
    }
  | {
      id: string;
      kind: "TYPOLOGY";
      label: string;
      description: string;
      area: string;
      url?: never;
    }
  | {
      id: string;
      kind: "TOUR";
      label: string;
      description: string;
      url: string;
    }
  | {
      id: string;
      kind: "BROCHURE";
      label: string;
      description: string;
      url: string;
    };

export function createProjectMedia(
  project: HousingProject,
): ProjectMediaItem[] {
  const media: ProjectMediaItem[] = [
    {
      id: `${project.id}-main-photo`,
      kind: "PHOTO",
      label: "Vista principal",
      description: `Imagen oficial disponible de ${project.name}.`,
      image: project.image,
    },
    ...project.typologies.map((typology) => ({
      id: typology.id,
      kind: "TYPOLOGY" as const,
      label: typology.label,
      description: `${formatTypologyArea(typology.builtAreaM2)} de área construida.`,
      area: formatTypologyArea(typology.builtAreaM2),
    })),
    ...project.tours
      .filter(({ availability }) => availability === "AVAILABLE")
      .map((tour) => ({
        id: tour.id,
        kind: "TOUR" as const,
        label: tour.label,
        description: `Explora ${project.name} mediante un recorrido virtual disponible.`,
        url: tour.url,
      })),
  ];

  if (project.brochureUrl) {
    media.push({
      id: `${project.id}-brochure`,
      kind: "BROCHURE",
      label: "Folleto del proyecto",
      description:
        "Consulta espacios, características y detalles en el material comercial aprobado.",
      url: project.brochureUrl,
    });
  }

  return media;
}

export function moveProjectMediaIndex(
  currentIndex: number,
  itemCount: number,
  direction: -1 | 1,
): number {
  if (itemCount <= 0) return 0;
  return (currentIndex + direction + itemCount) % itemCount;
}
