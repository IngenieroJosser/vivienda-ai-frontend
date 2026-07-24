import type { MetadataRoute } from "next";
import { housingProjects } from "../lib/housing-catalog";
import { absoluteUrl, getSiteOrigin } from "../lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!getSiteOrigin()) return [];

  const projectPages: MetadataRoute.Sitemap = housingProjects.map(
    (project) => ({
      url: absoluteUrl(`/vivienda/proyectos/${project.id}`),
      lastModified: latestProjectVerification(project),
      changeFrequency: "monthly",
      priority: 0.8,
      images: [absoluteUrl(project.image)],
    }),
  );

  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/vivienda/proyectos"),
      lastModified: latestCatalogVerification(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...projectPages,
  ];
}

function latestCatalogVerification(): string {
  return housingProjects
    .flatMap((project) => project.evidence.map(({ verifiedAt }) => verifiedAt))
    .sort()
    .at(-1) ?? "2026-07-23";
}

function latestProjectVerification(
  project: (typeof housingProjects)[number],
): string {
  return project.evidence
    .map(({ verifiedAt }) => verifiedAt)
    .sort()
    .at(-1) ?? latestCatalogVerification();
}
