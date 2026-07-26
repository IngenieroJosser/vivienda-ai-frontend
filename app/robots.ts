import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteOrigin } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/vivienda/proyectos/"],
      disallow: [
        "/asesor",
        "/asesor/",
        "/login",
        "/orientacion",
        "/orientacion/",
        "/vivienda/agendar",
      ],
    },
    ...(origin
      ? {
          sitemap: absoluteUrl("/sitemap.xml"),
          host: origin.origin,
        }
      : {}),
  };
}
