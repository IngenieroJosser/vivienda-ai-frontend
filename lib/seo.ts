import type { Metadata } from "next";

export function getSiteOrigin(): URL | null {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configuredUrl) return null;
  try {
    return new URL(configuredUrl);
  } catch {
    return null;
  }
}

export const siteConfig = {
  name: "Vivienda Colsubsidio",
  shortName: "Vivienda",
  description:
    "Orientación personalizada para conocer proyectos de vivienda y encontrar un siguiente paso claro.",
  locale: "es_CO",
  language: "es-CO",
} as const;

export function absoluteUrl(path = "/"): string {
  const origin = getSiteOrigin();
  return origin ? new URL(path, origin).toString() : path;
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  image?: string;
  index?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  image,
  index = true,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const origin = getSiteOrigin();
  const socialImage = origin && image ? absoluteUrl(image) : null;

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index,
      follow: index,
      googleBot: {
        index,
        follow: index,
        "max-image-preview": index ? "large" : "none",
        "max-snippet": index ? -1 : 0,
        "max-video-preview": index ? -1 : 0,
      },
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title,
      description,
      ...(origin ? { url: canonical } : {}),
      ...(socialImage
        ? {
            images: [
              {
                url: socialImage,
                width: 1200,
                height: 630,
                alt: `${title} | ${siteConfig.name}`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(socialImage ? { images: [socialImage] } : {}),
    },
  };
}

export function createPrivateMetadata(
  title: string,
  description = "Área operativa de Vivienda Colsubsidio.",
): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        "max-image-preview": "none",
        "max-snippet": 0,
        "max-video-preview": 0,
      },
    },
    referrer: "strict-origin-when-cross-origin",
  };
}

export type JsonLd = Record<string, unknown> | readonly Record<string, unknown>[];

export function serializeJsonLd(value: JsonLd): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
