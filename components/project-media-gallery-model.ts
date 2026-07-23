import type { HousingProject } from "../lib/housing-catalog";

export type ProjectGalleryImage = {
  id: string;
  label: string;
  description: string;
  image: string;
};

export type ProjectResource = {
  id: string;
  kind: "TOUR" | "BROCHURE";
  label: string;
  description: string;
  url: string;
};

export function createProjectGalleryImages(
  project: HousingProject,
): ProjectGalleryImage[] {
  return [
    {
      id: `${project.id}-main-photo`,
      label: "Vista principal",
      description: `Imagen oficial disponible del proyecto ${project.name}.`,
      image: project.image,
    },
  ];
}

export function createProjectResources(
  project: HousingProject,
): ProjectResource[] {
  const resources: ProjectResource[] = project.tours
    .filter(({ availability }) => availability === "AVAILABLE")
    .map((tour) => ({
      id: tour.id,
      kind: "TOUR" as const,
      label: tour.label,
      description: "Recorrido virtual disponible en una ventana externa.",
      url: tour.url,
    }));

  if (project.brochureUrl) {
    resources.push({
      id: `${project.id}-brochure`,
      kind: "BROCHURE",
      label: "Folleto del proyecto",
      description: "Material comercial aprobado con información del proyecto.",
      url: project.brochureUrl,
    });
  }

  return resources;
}
