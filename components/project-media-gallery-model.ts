import type {
  HousingProject,
  ProjectGalleryMedia,
} from "../lib/housing-catalog";

export type ProjectGalleryImage = ProjectGalleryMedia;

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
  return [...project.gallery];
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
      description: "Explora los espacios del proyecto en una experiencia 360°.",
      url: tour.url,
    }));

  if (project.brochureUrl) {
    resources.push({
      id: `${project.id}-brochure`,
      kind: "BROCHURE",
      label: "Folleto del proyecto",
      description: "Consulta características, planos y detalles del proyecto.",
      url: project.brochureUrl,
    });
  }

  return resources;
}
