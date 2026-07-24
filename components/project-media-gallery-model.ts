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

type SlideGeometry = {
  offset: number;
  width: number;
};

export function getCenteredSlideOffset({
  trackWidth,
  slideOffset,
  slideWidth,
}: {
  trackWidth: number;
  slideOffset: number;
  slideWidth: number;
}): number {
  return slideOffset - (trackWidth - slideWidth) / 2;
}

export function getClosestSlideIndex({
  scrollLeft,
  trackWidth,
  slides,
}: {
  scrollLeft: number;
  trackWidth: number;
  slides: readonly SlideGeometry[];
}): number {
  if (!slides.length) return 0;

  const viewportCenter = scrollLeft + trackWidth / 2;
  return slides.reduce((closestIndex, slide, index) => {
    const slideCenter = slide.offset + slide.width / 2;
    const closest = slides[closestIndex];
    const closestCenter = closest.offset + closest.width / 2;
    return Math.abs(slideCenter - viewportCenter) <
      Math.abs(closestCenter - viewportCenter)
      ? index
      : closestIndex;
  }, 0);
}

export function getHorizontalSwipeDirection({
  startX,
  startY,
  endX,
  endY,
  threshold = 48,
}: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  threshold?: number;
}): "PREVIOUS" | "NEXT" | null {
  const horizontalDistance = endX - startX;
  const verticalDistance = endY - startY;
  const isIntentionalHorizontalSwipe =
    Math.abs(horizontalDistance) >= threshold &&
    Math.abs(horizontalDistance) > Math.abs(verticalDistance) * 1.25;

  if (!isIntentionalHorizontalSwipe) return null;
  return horizontalDistance < 0 ? "NEXT" : "PREVIOUS";
}

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
